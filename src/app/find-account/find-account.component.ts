import { Component, OnInit } from '@angular/core'
import { Currency } from '../models/tokens.model'
import { AccountInfo } from '../models/account-info.model'
import { AccountService, LoginService, DialogsService } from '../services'
import { AccountsByKeyModel } from '../models/accounts-by-key.model'
import { LocalStorage } from 'ngx-webstorage'
import { TranslateService } from '@ngx-translate/core'
import { NetworkChaindId } from '../models/network.model'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import {isNull} from "util";

@Component({
  selector: 'app-find-account',
  templateUrl: './find-account.component.html',
  styleUrls: [
    '../../icon.styles.scss',
    '../../tooltip.style.scss',
    './find-account.component.scss',
    '../../page-container.styles.scss',
    '../../input.style.scss',
    '../../button.styles.scss',
    '../../progress-bar.styles.scss'
  ]
})
export class FindAccountComponent implements OnInit {
  faQuestionCircle = faQuestionCircle
  @LocalStorage()
  currentNetwork: string

  @LocalStorage()
  currentchainid: string

  userSymbol: string[][] = []
  exUsdTotal: number
  accounts: AccountsByKeyModel
  acoountsInf: AccountInfo[] = []
  tokenArray: { token: string, balance: string, international: string }[] = []
  searchComplite: boolean
  searchAccount: boolean
  successName: boolean
  successKey: boolean
  errorName: boolean
  errorKey: boolean
  tokenInfo: string
  errorMessage: string
  procent: string
  procentNum: number[]
  netData: string[]
  cpuData: string[]
  tokenCut: string[]
  staked: number
  unstaked: number
  result: AccountInfo
  accountData: string
  tokenStringTemp: string
  tokenStringTemps: string[]

  constructor (
    private data: AccountService,
    public loginService: LoginService,
    private translate: TranslateService,
    private dialogsService: DialogsService
  ) { }

  ngOnInit () {
    this.successName = false
    this.successKey = false
    this.errorName = false
    //  this.tokenList = new Currency()
    this.tokenArray = []
    this.tokenInfo = ''
    this.errorMessage = ''
    this.procentNum = [0]
  }

  chooseType () {
    if (this.accountData.length === 12) {
      this.findAccountName(this.accountData.toLowerCase())
    } else {
      this.findAccountsKey(this.accountData)
    }
  }

  findAccountName (accountName: string) {
    this.procent = '0'
    let tokenList = new Currency()
    this.successName = false
    this.successKey = false
    this.errorName = false
    this.errorKey = false
    this.tokenArray = []
    const requestBody = '{"account_name":"' + accountName + '"}'
    this.data.findByName(requestBody).subscribe(
      data => {
        this.searchComplite = true
        this.acoountsInf = []
        this.successName = true
        if (!data) {
          return
        }
        this.result = data
        this.result.cpu_stacked = this.result.total_resources.cpu_weight
        this.result.net_stacked = this.result.total_resources.net_weight
        this.result.net_self_stacked = this.result.self_delegated_bandwidth ? this.result.self_delegated_bandwidth.net_weight : '0'
        this.result.cpu_self_stacked = this.result.self_delegated_bandwidth ? this.result.self_delegated_bandwidth.cpu_weight : '0'
        this.result.staked = this.result.voter_info && this.result.voter_info.staked / 10000
        this.result.cpu_other_stacked = (Number(this.result.cpu_stacked.split(' ', 1)[0]) - Number(this.result.cpu_self_stacked.split(' ', 1)[0])).toFixed(4).toString() + ' JUN'
        this.result.net_other_stacked = (Number(this.result.net_stacked.split(' ', 1)[0]) - Number(this.result.net_self_stacked.split(' ', 1)[0])).toFixed(4).toString() + ' JUN'
        this.result.balance_cut = this.result.core_liquid_balance ? this.result.core_liquid_balance.split('.', 2) : []
        this.result.netData = this.result.total_resources.net_weight.split(' ', 1)
        this.result.cpuData = this.result.total_resources.cpu_weight.split(' ', 1)
        this.result.voter_info = this.result.voter_info ? this.result.voter_info : { staked: 0 }
        this.result.voter_info.staked = this.result.voter_info ? this.result.voter_info.staked / 10000 : 0
        this.result.net_percent = Math.round(Number(this.result.net_limit.used) / Number(this.result.net_limit.max) * 100)
        this.result.cpu_percent = Math.round(Number(this.result.cpu_limit.used) / Number(this.result.cpu_limit.max) * 100)
        this.result.ram_percent = Math.round(Number(this.result.ram_quota) - Number(this.result.ram_usage)) / Number(this.result.ram_quota) * 100
        this.result.procent_for_bar = Math.round((Number(this.result.ram_usage) / Number(this.result.ram_quota) * 100))
        if (typeof this.result.core_liquid_balance !== 'undefined') {
          this.result.total_balance = (Number(this.result.core_liquid_balance.split(' ', 1)[0]) + Number(this.result.voter_info.staked)).toString()
        } else {
          this.result.unstaked = 0
          this.result.total_balance = (Number(this.result.staked) + Number(this.result.unstaked)).toString()
        }
        this.result.total_balance_cut = this.result.total_balance.split('.', 2)
        this.result.cpu_used_sec = Number(this.result.cpu_limit.used) / 1000000
        this.result.cpu_max_sec = Number(this.result.cpu_limit.max) / 1000000
        this.result.cpu_available_sec = Number(this.result.cpu_limit.available) / 1000000
        this.result.net_used_layout = (Number(this.result.net_limit.used) / 1024).toFixed(3).toString()
        this.result.net_available_layout = (Number(this.result.net_limit.available) / 1024).toFixed(3).toString()
        this.result.net_max_layout = (Number(this.result.net_limit.max) / 1024).toFixed(3).toString()
        if (Number(this.result.net_available_layout) > 1024) {
          this.result.net_used_layout = (Number(this.result.net_used_layout) / 1024).toFixed(3).toString()
          this.result.net_max_layout = (Number(this.result.net_max_layout) / 1024).toFixed(3).toString()
          this.result.net_available_layout = (Number(this.result.net_available_layout) / 1024).toFixed(3).toString()
          this.result.net_sign_string = 'MB'
        } else {
          this.result.net_sign_string = 'KB'
        }
        this.result.ram_used_layout = (Number(this.result.ram_usage) / 1024).toFixed(3).toString()
        this.result.ram_available_layout = ((Number(this.result.ram_quota) - Number(this.result.ram_usage)) / 1024).toFixed(3).toString()
        this.result.ram_max_layout = (Number(this.result.ram_quota) / 1024).toFixed(3).toString()
        if (Number(this.result.ram_available_layout) > 1024) {
          this.result.ram_used_layout = (Number(this.result.ram_used_layout) / 1024).toFixed(3).toString()
          this.result.ram_max_layout = (Number(this.result.ram_max_layout) / 1024).toFixed(3).toString()
          this.result.ram_available_layout = (Number(this.result.ram_available_layout) / 1024).toFixed(3).toString()
          this.result.ram_sign_string = 'MB'
        } else {
          this.result.ram_sign_string = 'KB'
        }
        this.data.getCurrentCourse().subscribe(
          dataUSD => {
            this.result.usd_total = Number(this.result.total_balance) * Number(dataUSD.market_data.current_price.usd)
          })
        if (this.currentchainid === NetworkChaindId.MainNet) {
          this.data.getTokensGreymass(this.result.account_name).subscribe((tokens) => {
            if (tokens && tokens.length) {
              this.result.tokens = this.setTokensGreymassSymbol(tokens)
            } else {
              this.data.getTokensEosflare(this.result.account_name).subscribe((response) => {
                if (response && response.account) {
                  this.data.getTokenInfo('{"code":"' + 'eosio.token' + '","account":"' + this.result.account_name + '"}').subscribe((JUN) => {
                    this.result.tokens = this.setTokensEosflareSymbol(tokens.account.tokens, this.result.account_name)
                    this.result.tokens.push({ international: 'JUN', token: 'eosio.token', balance: JUN.toString().split(' ')[0] })
                  })
                } else {
                  this.data.getAllTokensInfo(tokenList.tokens, this.result.account_name).subscribe((tokensResult) => {
                    this.result.tokens = this.setTokensSymbol(tokensResult)
                  })
                }
              })
            }
          })
        } else {
          this.data.getAllTokensInfo(tokenList.tokens, this.result.account_name).subscribe((tokens) => {
            this.result.tokens = this.setTokensSymbol(tokens)
          })
        }
        this.result.refund_request_number = { net_amount: 0 , cpu_amount: 0 }
        if (!isNull(this.result.refund_request)) {
          if (!isNaN(parseFloat(this.result.refund_request.cpu_amount))) {
            this.result.refund = parseFloat(this.result.refund_request.cpu_amount)
            this.result.refund_request_number.cpu_amount = parseFloat(this.result.refund_request.cpu_amount)
          }
          if (!isNaN(parseFloat(this.result.refund_request.net_amount))) {
            this.result.refund = this.result.refund + parseFloat(this.result.refund_request.net_amount)
            this.result.refund_request_number.net_amount = parseFloat(this.result.refund_request.net_amount)
          }
          if (Date.parse(this.result.refund_request.request_time)) {
            let newDate = new Date(this.result.refund_request.request_time)
            newDate.setDate(newDate.getDate() + 3)
            this.result.refund_time = newDate.toLocaleDateString() + ' ' + newDate.toLocaleTimeString()
          }
        }
        this.acoountsInf = [this.result]
      },
      error => {
        this.errorName = true
        if (error.error.error.code === '0') {
          this.errorMessage = 'Unknown name'
        } else {
          this.errorMessage = error.message
        }
      })
  }

  findAccountsKey (publicKey: string) {
    let iter = 0
    let tokenList = new Currency()
    this.successName = false
    this.successKey = false
    this.errorName = false
    this.errorKey = false
    this.tokenArray = []
    const body = '{"public_key":"' + publicKey + '"}'
    this.data.findByKey(body).subscribe(
      data => {
        this.searchComplite = true
        this.acoountsInf = []
        this.successKey = true
        this.accounts = data
        for (let index in this.accounts.accounts) {
          this.data.findByName('{"account_name":"' + this.accounts.accounts[index] + '"}').subscribe(
            data => {
              this.result = data
              this.result.cpu_stacked = this.result.total_resources.cpu_weight
              this.result.net_stacked = this.result.total_resources.net_weight
              this.result.net_self_stacked = this.result.self_delegated_bandwidth.net_weight
              this.result.cpu_self_stacked = this.result.self_delegated_bandwidth.cpu_weight
              this.result.staked = this.result.voter_info.staked / 10000
              this.result.cpu_other_stacked = (Number(this.result.cpu_stacked.split(' ', 1)[0]) - Number(this.result.cpu_self_stacked.split(' ', 1)[0])).toFixed(4).toString() + ' JUN'
              this.result.net_other_stacked = (Number(this.result.net_stacked.split(' ', 1)[0]) - Number(this.result.net_self_stacked.split(' ', 1)[0])).toFixed(4).toString() + ' JUN'
              this.result.balance_cut = this.result.core_liquid_balance ? this.result.core_liquid_balance.split('.', 2) : []
              this.result.netData = this.result.total_resources.net_weight.split(' ', 1)
              this.result.cpuData = this.result.total_resources.cpu_weight.split(' ', 1)
              this.result.voter_info.staked = this.result.voter_info.staked / 10000
              this.result.net_percent = Math.round(Number(this.result.net_limit.used) / Number(this.result.net_limit.max) * 100)
              this.result.cpu_percent = Math.round(Number(this.result.cpu_limit.used) / Number(this.result.cpu_limit.max) * 100)
              this.result.ram_percent = Math.round(Number(this.result.ram_quota) - Number(this.result.ram_usage)) / Number(this.result.ram_quota) * 100
              this.result.procent_for_bar = Math.round((Number(this.result.ram_usage) / Number(this.result.ram_quota) * 100))
              if (typeof this.result.core_liquid_balance !== 'undefined') {
                this.result.total_balance = (Number(this.result.core_liquid_balance.split(' ', 1)[0]) + Number(this.result.voter_info.staked)).toString()
              } else {
                this.result.unstaked = 0
                this.result.total_balance = (Number(this.result.staked) + Number(this.result.unstaked)).toString()
              }
              this.result.total_balance_cut = this.result.total_balance.split('.', 2)
              this.result.cpu_used_sec = Number(this.result.cpu_limit.used) / 1000000
              this.result.cpu_available_sec = Number(this.result.cpu_limit.available) / 1000000
              this.result.cpu_max_sec = Number(this.result.cpu_limit.max) / 1000000
              this.result.net_used_kb = Number(this.result.net_limit.used) / 1000
              this.result.net_max_kb = Number(this.result.net_limit.max) / 1000
              this.result.ram_used_layout = (Number(this.result.ram_usage) / 1024).toFixed(3).toString()
              this.result.ram_available_layout = ((Number(this.result.ram_quota) - Number(this.result.ram_usage)) / 1024).toFixed(3).toString()
              this.result.ram_max_layout = (Number(this.result.ram_quota) / 1024).toFixed(3).toString()
              this.result.net_used_layout = (Number(this.result.net_limit.used) / 1024).toFixed(3).toString()
              this.result.net_available_layout = (Number(this.result.net_limit.available) / 1024).toFixed(3).toString()
              this.result.net_max_layout = (Number(this.result.net_limit.max) / 1024).toFixed(3).toString()
              if (Number(this.result.ram_available_layout) > 1024) {
                this.result.ram_used_layout = (Number(this.result.ram_used_layout) / 1024).toFixed(3).toString()
                this.result.ram_max_layout = (Number(this.result.ram_max_layout) / 1024).toFixed(3).toString()
                this.result.ram_available_layout = (Number(this.result.ram_available_layout) / 1024).toFixed(3).toString()
                this.result.ram_sign_string = 'MB'
              } else {
                this.result.ram_sign_string = 'KB'
              }
              if (Number(this.result.net_available_layout) > 1024) {
                this.result.net_used_layout = (Number(this.result.net_used_layout) / 1024).toFixed(3).toString()
                this.result.net_max_layout = (Number(this.result.net_max_layout) / 1024).toFixed(3).toString()
                this.result.net_available_layout = (Number(this.result.net_available_layout) / 1024).toFixed(3).toString()
                this.result.net_sign_string = 'MB'
              } else {
                this.result.net_sign_string = 'KB'
              }
              this.data.getCurrentCourse().subscribe(
                dataUSD => {
                  this.result.usd_total = Number(this.result.total_balance) * Number(dataUSD.market_data.current_price.usd)
                })
              if (this.currentchainid === NetworkChaindId.MainNet) {
                this.data.getTokensGreymass(this.result.account_name).subscribe((tokens) => {
                  if (tokens && tokens.length) {
                    this.result.tokens = this.setTokensGreymassSymbol(tokens)
                  } else {
                    this.data.getTokensEosflare(this.result.account_name).subscribe((response) => {
                      if (response && response.account) {
                        this.data.getTokenInfo('{"code":"' + 'eosio.token' + '","account":"' + this.result.account_name + '"}').subscribe((JUN) => {
                          this.result.tokens = this.setTokensEosflareSymbol(tokens.account.tokens, this.result.account_name)
                          this.result.tokens.push({ international: 'JUN', token: 'eosio.token', balance: JUN.toString().split(' ')[0] })
                        })
                      } else {
                        this.data.getAllTokensInfo(tokenList.tokens, this.result.account_name).subscribe((tokensResult) => {
                          this.result.tokens = this.setTokensSymbol(tokensResult)
                        })
                      }
                    })
                  }
                })
              } else {
                this.data.getAllTokensInfo(tokenList.tokens, this.result.account_name).subscribe((tokens) => {
                  this.result.tokens = this.setTokensSymbol(tokens)
                })
              }
              this.result.refund_request_number = { net_amount: 0 , cpu_amount: 0 }
              if (!isNull(this.result.refund_request)) {
                if (!isNaN(parseFloat(this.result.refund_request.cpu_amount))) {
                  this.result.refund = parseFloat(this.result.refund_request.cpu_amount)
                  this.result.refund_request_number.cpu_amount = parseFloat(this.result.refund_request.cpu_amount)
                }
                if (!isNaN(parseFloat(this.result.refund_request.net_amount))) {
                  this.result.refund = this.result.refund + parseFloat(this.result.refund_request.net_amount)
                  this.result.refund_request_number.net_amount = parseFloat(this.result.refund_request.net_amount)
                }
                if (Date.parse(this.result.refund_request.request_time)) {
                  let newDate = new Date(this.result.refund_request.request_time)
                  newDate.setDate(newDate.getDate() + 3)
                  this.result.refund_time = newDate.toLocaleDateString() + ' ' + newDate.toLocaleTimeString()
                }
              }
              this.acoountsInf[iter] = this.result
              this.acoountsInf[iter].procent_for_bar = Math.round((Number(this.result.ram_usage) / Number(this.result.ram_quota) * 100))
              iter++
            },
            errorNameInfo => {
              this.errorName = true
              if (errorNameInfo.error.error.code === '0') {
                this.errorMessage = 'Unknown name'
              } else {
                this.errorMessage = errorNameInfo.message
              }
            }
          )
        }
      },
      error => {
        this.errorKey = true
        if (error.error.error.code === '10') {
          this.errorMessage = 'Assert exseption'
        } else {
          this.errorMessage = error.message
        }
      }
    )
  }

  private setTokensGreymassSymbol (tokens) {
    let tokensArray = []
    tokens.forEach(rez => {
      let precision = rez.amount.toString().split('.')[1] ? rez.amount.toString().split('.')[1].length : 0
      this.addUserSymbol(rez.symbol, rez.code, precision)
      tokensArray.push({ token: rez.code, balance: rez.amount, international: rez.symbol })
    })
    return tokensArray
  }

  private setTokensEosflareSymbol (tokens, accountName) {
    let tokensArray = []
    tokens.forEach(rez => {
      tokensArray.push({ token: rez.contract, balance: rez.balance, international: rez.symbol })
    })
    return tokensArray
  }

  private setTokensSymbol (tokens) {
    let tokensArray = []
    if (tokens && tokens.length) {
      let tokenStringTemp = ''
      tokens.forEach(resultArr => {
        resultArr.forEach(element => {
          let name = element.substring(element.lastIndexOf(' ') + 1)
          let code = new Currency().tokens.filter(function(c) {
            return c[1] === name
          })
          let precision
          let amount
          amount = element.split(' ')[0]
          if (element.indexOf('.') > -1) {
            precision = element.split('.', 2)[1].split(' ',1)[0].length
          } else {
            precision = 0
          }
          this.addUserSymbol(name, code[0][0], precision)
          tokenStringTemp += element + ', '
          tokensArray.push({ international: name, token: code[0][0], balance: amount })
        })
      })
      return tokensArray
    }
    return tokensArray
  }

  private addUserSymbol (symbol: string, code: string, precision: string) {
    let findSymbol = false
    this.userSymbol.forEach(element => {
      if (element[0].toLocaleLowerCase() === symbol.toLocaleLowerCase()) {
        findSymbol = true
        return
      }
    })
    if (!findSymbol) {
      this.userSymbol.push([symbol, code, precision])
    }
  }
}
