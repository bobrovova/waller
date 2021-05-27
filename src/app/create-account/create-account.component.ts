import { Component } from '@angular/core'
import { Account } from '../models/account.model'
import { LocalStorage } from 'ngx-webstorage'
import { LoginState } from '../models/login-state.model'
import { LoginService, DialogsService, ButtonBlockService } from '../services'
import { TranslateService } from '@ngx-translate/core'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: [
    './create-account.component.scss',
    '../../input.style.scss',
    '../../button.styles.scss',
    '../../page-container.styles.scss',
    '../../icon.styles.scss'
  ]
})
export class CreateAccountComponent {
  faQuestionCircle = faQuestionCircle
  network: any
  eos: any

  @LocalStorage()
  buttonUsed: boolean
  @LocalStorage()
  isLoggedIn: LoginState
  @LocalStorage()
  accountName: string
  @LocalStorage()
  permission: string
  @LocalStorage()
  currentPluginName: string

  model: Account

  constructor (
    public buttonBlockService: ButtonBlockService,
    private dialogsService: DialogsService,
    private translate: TranslateService,
    public loginService: LoginService
  ) {
    this.buttonUsed = false
    this.model = (this.loginService.loggedIn())
      ? new Account('', this.accountName, '', '', 0.001, 0.001, 8192, false)
      : new Account('', '', '', '', null, null, null, false)
  }

  loggedIn () {
    if (this.isLoggedIn != null && this.isLoggedIn !== LoginState.out) {
      return true
    } else {
      return false
    }
  }

  // under plugin works only with active key
  // works with owner or active when user is logged in with keys
  async createAccount (model) {
    this.buttonUsed = true
    const message = await this.translate.get(`dialogs.${this.currentPluginName}-should-appear`).toPromise()
    const title = await this.translate.get('dialogs.transaction-wil-be-sent').toPromise()
    this.dialogsService.showSending(message, title)

    try {
      let obj = await this.loginService.setupEos()
      this.eos = obj.eos
      this.network = obj.network

      const options = { authorization: [`${this.accountName}@${this.permission}`] }
      console.log('Here1')

      await this.eos.transact({
        actions: [{
          account: 'eosio',
          name: 'newaccount',
          authorization: [{
            actor: model.owner.toLowerCase(),
            permission: 'active',
          }],
          data: {
            creator: model.owner.toLowerCase(),
            name: model.name.toLowerCase(),
            owner: {
              threshold: 1,
              keys: [{
                key: model.ownerKey,
                weight: 1
              }],
              accounts: [],
              waits: []
            },
            active: {
              threshold: 1,
              keys: [{
                key: model.activeKey,
                weight: 1
              }],
              accounts: [],
              waits: []
            },
          },
        }, {
          account: 'eosio',
          name: 'buyrambytes',
          authorization: [{
            actor: model.owner.toLowerCase(),
            permission: 'active',
          }],
          data: {
            payer: model.owner.toLowerCase(),
            receiver: model.name.toLowerCase(),
            bytes: 8192,
          },
        }, {
          account: 'eosio',
          name: 'delegatebw',
          authorization: [{
            actor: model.owner.toLowerCase(),
            permission: 'active',
          }],
          data: {
            from: model.owner.toLowerCase(),
            receiver: model.name.toLowerCase(),
            stake_net_quantity: String(model.netStake.toFixed(4)) + ' SYS',
            stake_cpu_quantity: String(model.cpuStake.toFixed(4)) + ' SYS',
            transfer: Number(model.transfer | 0),
          }
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      })

      /*await this.eos.transaction(tr => {
        console.log(model)
        console.log(options)
        console.log(this.eos)
        tr.newaccount({
          creator: model.owner.toLowerCase(),
          name: model.name.toLowerCase(),
          owner: model.ownerKey,
          active: model.activeKey
        }, options)
        console.log('Here2')/*

        tr.buyrambytes({
          payer: model.owner.toLowerCase(),
          receiver: model.name.toLowerCase(),
          bytes: model.bytes
        }, options)
        console.log('Here3')


        /*tr.delegatebw({
          from: model.owner.toLowerCase(),
          receiver: model.name.toLowerCase(),
          stake_net_quantity: String(model.netStake.toFixed(4)) + ' JUN',
          stake_cpu_quantity: String(model.cpuStake.toFixed(4)) + ' JUN',
          transfer: Number(model.transfer | 0)
        }, options)
        console.log('Here4')

      })*/
      this.dialogsService.showSuccess(await this.translate.get('create-account.account-created').toPromise())
    } catch (err) {
      console.log(err)
      this.dialogsService.showFailure(err)
    }
    this.buttonUsed = false
  }

  async onSubmit () {
    await this.createAccount(this.model)
  }
}
