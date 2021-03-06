import { Component } from '@angular/core'
import { Delegate } from '../../models/delegate.model'
import { LocalStorage } from 'ngx-webstorage'
import { LoginState } from '../../models/login-state.model'
import { LoginService, DialogsService, ButtonBlockService } from '../../services'
import { TranslateService } from '@ngx-translate/core'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: [
    './delegate.component.scss',
    '../../../button.styles.scss',
    '../../../input.style.scss',
    '../../../page-container.styles.scss',
    '../../../icon.styles.scss'
  ]
})
export class DelegateComponent {

  @LocalStorage()
  accountName: string
  @LocalStorage()
  permission: string
  @LocalStorage()
  isLoggedIn: LoginState
  @LocalStorage()
  buttonUsed: boolean
  @LocalStorage()
  currentPluginName: string

  faQuestionCircle = faQuestionCircle

  model: Delegate
  network: any
  eos: any

  accountMissing: any

  constructor (
    public loginService: LoginService,
    private dialogsService: DialogsService,
    private translate: TranslateService,
    public buttonBlockService: ButtonBlockService
  ) {
    this.model = new Delegate()
    this.model.transfer = false
    this.buttonUsed = false
  }

  async delegateBandwidth (model) {
    try {
      if (!this.eos) {
        let obj = await this.loginService.setupEos()
        this.eos = obj.eos
        this.network = obj.network
      }
      const options = { authorization: [`${this.accountName}@${this.permission}`] }

      this.dialogsService.showSending(await this.translate.get('dialogs.transaction-wil-be-sent').toPromise(),
       await this.translate.get(`dialogs.${this.currentPluginName}-should-appear`).toPromise())
        await this.eos.transact({
          actions: [{
            account: 'eosio',
            name: 'delegatebw',
            authorization: [{
              actor: this.accountName,
              permission: this.permission,
            }],
            data: {
              from: this.accountName,
              receiver: model.recipient.toLowerCase(),
              stake_net_quantity: String(model.net.toFixed(4)) + ' SYS',
              stake_cpu_quantity: String(model.cpu.toFixed(4)) + ' SYS',
              transfer: Number(model.transfer | 0),
            }
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 30,
        })
      this.dialogsService.showSuccess(await this.translate.get('undelegate.operation-completed').toPromise())
    } catch (error) {
      if (error.type === 'account_missing') {
        this.dialogsService.showFailure(await this.translate.get('undelegate.account-missing').toPromise())
      } else {
        if (error.code === 402) {
          this.dialogsService.showInfo(error.message)
        } else {
          this.dialogsService.showFailure(error)
        }
      }
    }
    this.buttonUsed = false
  }

  onSubmit () {
    this.buttonUsed = true
    this.model.stakeOwner = this.accountName
    this.delegateBandwidth(this.model)
  }
}
