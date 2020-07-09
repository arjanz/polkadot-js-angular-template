import {Component, Input, OnInit} from '@angular/core';
import {ApiPromise} from '@polkadot/api';
import {Network} from '../../classes/network.class';
import {MatTableDataSource} from '@angular/material/table';
import {BalanceOverviewItem} from '../../account-form/account-form.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PolkadotJsService} from '../../services/polkadot-js.service';

@Component({
  selector: 'app-balance-mutation-overview',
  templateUrl: './balance-mutation-overview.component.html',
  styleUrls: ['./balance-mutation-overview.component.scss']
})
export class BalanceMutationOverviewComponent implements OnInit {

  @Input() network: Network;

  private api: ApiPromise;

  public data: BalanceOverviewItem[];

  dataSource = new MatTableDataSource<BalanceOverviewItem>();

  addressForm: FormGroup;

  constructor(private fb: FormBuilder, private polkadotJsService: PolkadotJsService) {}

  async ngOnInit(): Promise<void> {
    await this.setNetwork(this.network);
    await this.onSubmit();
  }

  async setNetwork(network: Network): Promise<void> {

    this.addressForm = this.fb.group({
      address: [network.defaultAddress, Validators.required],
      startBlock: [network.startBlock, Validators.required],
      endBlock: [null, Validators.required],
      interval: [100800, Validators.required]
    });

    this.api = await this.polkadotJsService.createApi(network.nodeUrl);

    const header = await this.api.rpc.chain.getHeader();

    this.addressForm.controls.endBlock.setValue(header.number.toNumber());
  }

  async onSubmit(): Promise<void> {

    this.data = [];

    // Loop through block interval
    let prevAmount = null;
    let blockEnd: number = null;
    for (let i = this.addressForm.value.startBlock; i < this.addressForm.value.endBlock; i = i + this.addressForm.value.interval) {
        const blockHash = await this.api.rpc.chain.getBlockHash(i);
        const accountInfo = await this.api.query.system.account.at(blockHash, this.addressForm.value.address);

        if (prevAmount !== null) {
          this.data.push({
            blockStart: i - this.addressForm.value.interval,
            blockEnd: i,
            amount: accountInfo.data.free.toNumber() - prevAmount,
            perc: 0,
            value: (accountInfo.data.free.toNumber() - prevAmount) * this.network.conversionRate
          });
        }

        prevAmount = accountInfo.data.free.toBn();
        blockEnd = i;

    }
    const blockHash = await this.api.rpc.chain.getBlockHash(this.addressForm.value.endBlock);
    const accountInfo = await this.api.query.system.account.at(blockHash, this.addressForm.value.address);

    this.data.push({
      blockStart: blockEnd,
      blockEnd: null,
      amount: accountInfo.data.free.toNumber() - prevAmount,
      perc: 0,
      value: (accountInfo.data.free.toNumber() - prevAmount) * this.network.conversionRate
    });

    this.dataSource.data = this.data;
  }

}
