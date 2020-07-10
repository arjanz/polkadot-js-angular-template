import { Component } from '@angular/core';
import {Network} from './classes/network.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Balance mutation overview';

  networks: Network[] = [
    {
      name: 'Polkadot',
      nodeUrl: 'wss://rpc.polkadot.io',
      conversionRate: 115,
      startBlock: 326550,
      defaultAddress: '13uW7auWPX9WAtqwkBx7yagb78PLcv8FAcPZEVCovbXoNJK4'
    },
    {
      name: 'Kusama',
      nodeUrl: 'wss://kusama-rpc.polkadot.io/',
      conversionRate: 7,
      startBlock: 2710000,
      defaultAddress: 'EqyCQvYn1cHBdzFVQHQeL1nHDcxHhjWR8V48KbDyHyuyCGV'
    },
  ];
}
