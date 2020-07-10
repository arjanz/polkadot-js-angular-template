import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ApiPromise} from '@polkadot/api';
import {Network} from '../../classes/network.class';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PolkadotJsService} from '../../services/polkadot-js.service';
import {BalanceOverviewItem} from '../../classes/balance-overview-item.class';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-balance-mutation-overview',
  templateUrl: './balance-mutation-overview.component.html',
  styleUrls: ['./balance-mutation-overview.component.scss']
})
export class BalanceMutationOverviewComponent implements OnInit, OnDestroy {

  @Input() network: Network;

  private api: ApiPromise;
  public dataSource = new MatTableDataSource<BalanceOverviewItem>();
  public addressForm: FormGroup;

  private fragmentSubsription: Subscription;
  public loading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private polkadotJsService: PolkadotJsService
  ) {}

  async ngOnInit(): Promise<void> {

    this.addressForm = this.fb.group({
      address: [null, Validators.required],
      startBlock: [null, Validators.required],
      endBlock: [null, Validators.required],
      interval: [100800, Validators.required]
    });
    this.loading = true;
    await this.setNetwork(this.network);

    this.fragmentSubsription = this.activatedRoute.queryParams.subscribe(queryParams => {
      // Override address and startBlock form fields if set in URL query parameters
      this.addressForm.controls.address.setValue(queryParams[this.network.name + '_address'] || this.network.defaultAddress);
      this.addressForm.controls.startBlock.setValue(+queryParams[this.network.name + '_startBlock'] || this.network.startBlock);

      if (this.addressForm.value.address && this.addressForm.value.startBlock > 0) {
        this.onSubmit();
      }
    });
    this.loading = false;
  }

  async setNetwork(network: Network): Promise<void> {
    // Create or get Polkadot-JS instance for given node URL
    this.api = await this.polkadotJsService.createApi(network.nodeUrl);
    // Set end block to chain tip
    const header = await this.api.rpc.chain.getHeader();
    this.addressForm.controls.endBlock.setValue(header.number.toNumber());
  }

  async onSubmit(): Promise<void> {

    const data: BalanceOverviewItem[] = [];

    // Loop through block interval
    let prevAmount = null;
    let blockEnd: number = null;

    for (let i = this.addressForm.value.startBlock; i < this.addressForm.value.endBlock; i = i + this.addressForm.value.interval) {

        const blockHash = await this.api.rpc.chain.getBlockHash(i);
        const accountInfo = await this.api.query.system.account.at(blockHash, this.addressForm.value.address);

        if (prevAmount !== null) {
          data.push({
            blockStart: i - this.addressForm.value.interval,
            blockEnd: i,
            amount: accountInfo.data.free.toNumber() - prevAmount,
            perc: 0,
            value: (accountInfo.data.free.toNumber() - prevAmount) * this.network.conversionRate
          });
        }

        prevAmount = accountInfo.data.free.toBn();
        blockEnd = i;

        this.dataSource.data = data;

    }
    const blockHash = await this.api.rpc.chain.getBlockHash(this.addressForm.value.endBlock);
    const accountInfo = await this.api.query.system.account.at(blockHash, this.addressForm.value.address);

    data.push({
      blockStart: blockEnd,
      blockEnd: null,
      amount: accountInfo.data.free.toNumber() - prevAmount,
      perc: 0,
      value: (accountInfo.data.free.toNumber() - prevAmount) * this.network.conversionRate
    });

    this.dataSource.data = data;
  }

  ngOnDestroy(): void {
    // Will clear when component is destroyed e.g. route is navigated away from.
    this.fragmentSubsription.unsubscribe();
  }

}
