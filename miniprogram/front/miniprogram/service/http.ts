let _header = { "Content-Type": "application/json" }

// get请求
function get(url: string, data = {}) {
    let header = _header = { "Content-Type": "application/json" }
    return sendRequest(url, data, header, 'GET')
}

// post请求
function post(url: string, data = {}) {
    let header = _header = { "Content-Type": "application/x-www-form-urlencoded" }
    return sendRequest(url, data, header, 'POST')
}

// 网络请求的工具类
function sendRequest(url: string, data = {}, header = _header, method: 'GET' | 'POST' = 'GET') {
    const app = getApp()
    return new Promise((resolve, reject) => {
        wx.request({
            url: app.globalData.urlPrefix + url,
            data: data,
            method: method,
            header: header,
            dataType: 'json',// 默认也是json的，这里可以改成其他的
            success: function (res) {
                if (res.statusCode === 200) {
                    //200: 服务端业务处理正常结束
                    resolve(res)
                } else {
                    reject(res)
                }
            },
            fail: function (res) {
                reject(res)
            }
        })
    })
}

module.exports = {
    get,
    post,
    sendRequest
}