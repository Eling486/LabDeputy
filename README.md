# LabDeputy

LabDeputy

## 简介

本项目状态：`开发中`

## 在群晖中部署

### 安装 Container Manager 套件

### 新建容器目录
在`/volume1/docker`目录中新建`LabDeputy`文件夹

### 使用 Docker Compose 安装 LabDeputy

切换至`项目`选项卡，点击`新增`，填写项目名称（例如：`lab_deputy`）,设置路径为上一步新建的`/volume1/docker/LabDeputy`文件夹，来源选择**创建docker-compose.yml**，将下面的配置信息粘贴到输入框后，点击下一步直至创建成功。

``` yaml
version: "3.4"

services:
  LabDeputy:
    image: "eling486/lab_deputy:latest"
    container_name: "lab_deputy"
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - "./:/app/data"
    network_mode: bridge
    environment:
      - TZ=Asia/Shanghai
      - PGID=1000
      - PUID=1000
      - UMASK=022
```

默认用户名为admin，密码：Adminadmin

**部署成功后，请先访问应用（默认端口为`8080`）中的设置页，修改默认用户名及密码**

## 开发部署

``` bash
git clone https://github.com/Eling486/LabDeputy.git
cd LabDeputy
yarn
yarn global add pm2

# Build frontend (optional)
yarn build

# Development environment
yarn dev

# OR production environment
yarn start
# AND stop the app
yarn stop

```