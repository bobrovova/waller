import { Component } from '@angular/core'
import { LoginService, DialogsService, ButtonBlockService } from '../../services'
import { LocalStorage } from 'ngx-webstorage'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-refund-stake',
  templateUrl: './refund-stake.component.html',
  styleUrls: [
    './refund-stake.component.scss',
    '../../../input.style.scss',
    '../../../button.styles.scss',
    '../../../page-container.styles.scss'
  ]
})
export class RefundStakeComponent {
  @LocalStorage()
  accountName: string
  @LocalStorage()
  permission: string
  @LocalStorage()
  buttonUsed: boolean
  @LocalStorage()
  currentPluginName: string

  owner: string
  network: any
  eos: any

  constructor (
    public buttonBlockService: ButtonBlockService,
    public loginService: LoginService,
    private translate: TranslateService,
    private dialogsService: DialogsService
  ) {
    this.buttonUsed = false
  }

  async onSubmit () {
    this.buttonUsed = true

    let obj = await this.loginService.setupEos()
    this.eos = obj.eos
    this.network = obj.network

    const options = { authorization: [`${this.accountName}@${this.permission}`] }

    this.dialogsService.showSending(await this.translate.get('dialogs.transaction-wil-be-sent').toPromise(),
     await this.translate.get(`dialogs.${this.currentPluginName}-should-appear`).toPromise())

    try {
      await this.eos.transact({
        actions: [{
          account: 'eosio',
          name: 'refund',
          authorization: [{
            actor: this.accountName,
            permission: this.permission,
          }],
          data: {
            owner: this.owner.toLowerCase()
          }
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      })
      this.dialogsService.showSuccess(await this.translate.get('common.operation-completed').toPromise())
    } catch (error) {
      if (error.code === 402) {
        this.dialogsService.showInfo(error.message)
      } else {
        this.dialogsService.showFailure(error)
      }
    }
    this.buttonUsed = false
  }
}
