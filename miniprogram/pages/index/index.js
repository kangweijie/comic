//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    getuserinfo: '',
    queryuserinfo: {},
    barcodevalue: '',
    uploadImage:[]
  },

  onLoad: function() {
    /* wx.showActionSheet({
      itemList: ['A', 'B', 'C'],
      success(res) {
        console.log(res.tapIndex)
      },
      fail(res) {
        console.log(res.errMsg)
      }
    }); */
   /*  wx.showNavigationBarLoading({});
    wx.setNavigationBarTitle({ title:'"jijiburst"'}) */
   /*  wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ff0000',
      animation: {
        duration: 400,
        timingFunc: 'linear'
      }
    })

    wx.setTopBarText({
      text: 'hello, world!'
    })
    wx.setBackgroundColor({
      backgroundColorTop: '#ffffff', // 顶部窗口的背景色为白色
      backgroundColorBottom: '#ffffff', // 底部窗口的背景色为白色
    })
    wx.setBackgroundTextStyle({
      textStyle: 'dark' // 下拉背景字体、loading 图的样式为dark
    })

    wx.startPullDownRefresh() */


    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },
  insert: function() { /* 插入单条数据 */
    console.log('insert')
    db.collection('user').add({
      data: {
        name: 'jerry',
        age: 20
      }
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.warn(err)
    });

  },
  delete: function() { /*  删除单条数据 */
    db.collection('user').doc('f1006ad85d22aad20316a03f79e57650').remove().then(res => {
      console.log('delete success')
    })
  },
  alter: function() { /*  更新单条数据 */
    db.collection('user').doc('9afd9b6a5d1f06410148a40a313b3a56').update({
      data: {
        name: '康伟杰'
      }
    }).then(res => {
      console.log("update success")
    })
  },
  get: function() { /*  获取单条数据 */
    db.collection('user').doc('9afd9b6a5d1f06410148a40a313b3a56').get().then(res => {
      this.setData({
        queryuserinfo: res.data
      })
    })
  },
  calcsum: function() { /* 求和 */

    wx.cloud.callFunction({
      name: 'sum',
      data: {
        a: 2,
        b: 3
      }
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    });
  },
  getopenid: function() { /*  获取opendid */
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => {
      console.log(res.result)
    }).catch(err => {
      console.log(err)
    });

  },
  batchDelUser: function() {
    wx.cloud.callFunction({
      name: 'batchDelete',
    }).then(err => {
      console.log(res)
    }).catch(e => {
      console.log(e)
    })
  },
  scanCode: function() { /*  扫描条形码 */
    const that = this;
    wx.scanCode({
      success(res) {
        console.log(res.result)
        that.setData({
          barcodevalue: res.result
        })
      }
    })
  },
  barcodeFocus: function() {
    const that = this;
    wx.scanCode({
      success(res) {
        that.setData({
          barcodevalue: res.result
        })
      }
    })
  },
  chooseuploadImage: function() {
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success :res=> {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          uploadImage: this.data.uploadImage.concat(res.tempFilePaths)
        });

        /* 上传 */
        var promiseArr = [];
        wx.showToast({
          title: '上传中',
        });
        for(let i=0;i<this.data.uploadImage.length;i++){
          promiseArr.push(new Promise((resolve,reject)=>{
            let item = this.data.uploadImage[i];
            let suffix = /\.\w+$/.exec(item);
            wx.cloud.uploadFile({
              cloudPath: new Date().getTime() + suffix,
              filePath: item, // 文件路径
            }).then(res => {
              // get resource ID
              console.log(res.fileID)
            }).catch(error => {
              // handle error
            })
          }));
        }
        
        

        Promise.all(promiseArr).then(res=>{
          console.log(res);
          wx.hideToast();
        }).catch(err=>{
          console.error(err)
          wx.hideToast();
        })
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})