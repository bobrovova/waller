import { Component, OnInit } from '@angular/core'
import { ConfigService } from '../services/config.service'
import { LocalStorage } from 'ngx-webstorage'
import { LoginState } from '../models/login-state.model'

import { ECC } from 'eosjs'
import { LoginComponent } from '../login/login.component'

var { ecc } = ECC

@Component({
  selector: 'app-generate-key-pairs',
  templateUrl: './generate-key-pairs.component.html',
  styleUrls: [
    './generate-key-pairs.component.scss',
    '../../page-container.styles.scss',
    '../../input.style.scss',
    '../../button.styles.scss'
  ]
})

export class GenerateKeyPairsComponent implements OnInit {

  @LocalStorage()
  isLoggedIn: LoginState


  constructor () {
    this.pubKey
    this.privKey
  }

  loggedIn () {
    return (this.isLoggedIn != null && this.isLoggedIn !== LoginState.out)
  }

  ngOnInit () {
  }

  privKey: string
  pubKey: string

  async onSubmit () {
    ecc.randomKey().then(privateKey => {
      this.privKey = privateKey // wif
      this.pubKey = ecc.privateToPublic(privateKey).replace("EOS", "JUN")
      console.log(this.privKey)
      console.log(this.pubKey)
    })
  }
}
