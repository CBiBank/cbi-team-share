const app = getApp()
const api = require('../../service/todolist')
Page({
    onShareAppMessage() {
      return {
        title: 'form',
        path: 'page/component/pages/form/form'
      }
    },
  
    data: {
      pickerHidden: true,
      chosen: ''
    },
  
    pickerConfirm(e) {
      this.setData({
        pickerHidden: true
      })
      this.setData({
        chosen: e.detail.value
      })
    },
  
    pickerCancel() {
      this.setData({
        pickerHidden: true
      })
    },
  
    pickerShow() {
      this.setData({
        pickerHidden: false
      })
    },
  
    formSubmit(e) {
        api.apiAddTodoItem(e.detail.value).then(res => {
            console.log(res)
        })
    //   wx.request({
    //       method: 'POST',
    //       url: app.globalData.urlPrefix + '/todo/add',
    //       data: e.detail.value,
    //       dataType: 'json',
    //       success(res){
    //         console.log('res',res)
    //       },
    //       fail(err) {
    //           console.log('err',err)
    //       }
    //   })
    },
  
    formReset(e) {
      console.log('form发生了reset事件，携带数据为：', e.detail.value)
      this.setData({
        chosen: ''
      })
    }
  })