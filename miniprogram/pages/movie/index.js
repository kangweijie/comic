// pages/movie/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize: 4,
    movieList: []
  },
  getMovieList: function() {
    wx.showLoading({
      title: '加载中',
    })
    const db = wx.cloud.database()
    const todo = db.collection('comicList')
      .limit(this.data.pageSize)
      .get()
      .then(res => {
        this.setData({
          movieList: res.data
        });
        wx.hideLoading()
        wx.stopPullDownRefresh()
      })
    db.collection('comicList')
      .count()
      .then(res => {
        this.setData({
          count: res.total
        })
      })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getMovieList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getMovieList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    wx.showLoading({
      title: '加载中...',
    })
    if (this.data.movieList.length < this.data.count) {
      try {
        const db = wx.cloud.database();
        db.collection('comicList')
          .skip(this.data.movieList.length)
          .limit(this.data.pageSize)
          .get()
          .then(res => {
            this.setData({
              movieList: this.data.movieList.concat(res.data)
            })
            wx.hideLoading()
          }).catch(e => {
            console.error(e)
            wx.hideLoading()
          })
      } catch (e) {
        console.error(e);
      }
    } else {
      wx.showToast({
        title: '没有更多数据了',
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})