<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-links">
        <div class="link-group">
          <h3>购物指南</h3>
          <ul>
            <li><a href="javascript:void(0)">购物流程</a></li>
            <li><a href="javascript:void(0)">会员介绍</a></li>
            <li><a href="javascript:void(0)">常见问题</a></li>
          </ul>
        </div>

        <div class="link-group">
          <h3>配送方式</h3>
          <ul>
            <li><a href="javascript:void(0)">上门自提</a></li>
            <li><a href="javascript:void(0)">211限时达</a></li>
            <li><a href="javascript:void(0)">配送服务查询</a></li>
          </ul>
        </div>

        <div class="link-group">
          <h3>支付方式</h3>
          <ul>
            <li><a href="javascript:void(0)">货到付款</a></li>
            <li><a href="javascript:void(0)">在线支付</a></li>
            <li><a href="javascript:void(0)">分期付款</a></li>
          </ul>
        </div>

        <div class="link-group">
          <h3>售后服务</h3>
          <ul>
            <li><a href="javascript:void(0)">售后政策</a></li>
            <li><a href="javascript:void(0)">价格保护</a></li>
            <li><a href="javascript:void(0)">退款说明</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-copyright">
        <p>© 2025 Go Mall商城 版权所有</p>
        <p>ICP备案号: 京ICP备XXXXXXXX号-X</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #f8f8f8;
  padding: 40px 0 20px;
  margin-top: 40px;
  border-top: 1px solid #e4e4e4;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-links {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.link-group {
  min-width: 160px;
  margin-bottom: 20px;
}

.link-group h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.link-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-group li {
  margin-bottom: 8px;
}

.link-group a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}

.link-group a:hover {
  color: #409eff;
}

.footer-copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e4e4e4;
  color: #999;
  font-size: 12px;
}

.footer-copyright p {
  margin: 5px 0;
}
</style>
