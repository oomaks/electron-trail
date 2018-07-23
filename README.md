# npm 私服使用指南

### 概述
  服务器地址：http://172.30.3.107:8082
  登录和发布用户名与SVN用户名一致
  新的Nexus支持maven2和npm,并且对原有的nexus服务器进行了代理

### 配置
````Bash
npm config set registry http://172.30.3.107:8082/repository/npm_group/
yarn config set registry http://172.30.3.107:8082/repository/npm_group/
````
### 发布
在package.json中配置以下内容(三项内容，缺一不可)：
````JSON
{
  "name": "npmt",
  "version": "1.0.1",
  "publishConfig" : {
    "registry" : "http://172.30.3.107:8082/repository/npm_hosted/"
  }
}
````
````Bash
# 仅未登陆时执行
npm login -registry=http://172.30.3.107:8082/repository/npm_hosted/
npm publish
````
发布成功
