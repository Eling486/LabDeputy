DROP TABLE IF EXISTS user;
CREATE TABLE user(
    uid INTEGER NOT NULL, --用户ID
    username TEXT NOT NULL  , --用户名
    realname TEXT  , --真实姓名
    password TEXT  , --密码
    invitation TEXT  , --邀请码
    is_admin INTEGER NOT NULL  DEFAULT 0, --是否为管理员
    PRIMARY KEY (uid)
)  ; --用户表;

DROP TABLE IF EXISTS equipment;
CREATE TABLE equipment(
    equipment_id INTEGER NOT NULL, --设备ID
    name TEXT NOT NULL  , --设备名称
    type TEXT NOT NULL  , --设备类型
    status INTEGER NOT NULL DEFAULT 1, --状态，0-维修中，1-可用
    PRIMARY KEY (equipment_id)
)  ; --设备表

DROP TABLE IF EXISTS booking;
CREATE TABLE booking(
    booking_id INTEGER NOT NULL, --预约ID
    uid INTEGER NOT NULL  , --用户ID
    equipment_id INTEGER NOT NULL  , --设备ID
    start_time INTEGER NOT NULL  , --开始时间
    end_time INTEGER NOT NULL  , --结束时间
    status INTEGER NOT NULL DEFAULT 0, --状态，0-正常，-1-已取消
    PRIMARY KEY (booking_id)
)  ; --预约表;

DROP TABLE IF EXISTS tank;
CREATE TABLE tank(
    tank_id INTEGER NOT NULL, --冻存罐ID
    tank_name TEXT(255) NOT NULL  , --冻存罐名称
    catalog_no TEXT(255)   , --货号
    capacity INTEGER   , --总容量
    canisters INTEGER   , --提桶数量
    boxes INTEGER   , --每提桶盒数
    box_arrange TEXT(255)   , --冻存盒排列
    brand TEXT(255)   , --品牌
    details TEXT(255)   , --详情
    PRIMARY KEY (tank_id)
)  ; --tank

DROP TABLE IF EXISTS cell;
CREATE TABLE cell(
    cell_id INTEGER NOT NULL, --样品ID
    tank_id INTEGER NOT NULL  , --所在冻存罐ID
    canister INTEGER NOT NULL  , --所在提桶编号
    box INTEGER NOT NULL  , --所在冻存盒编号
    position INTEGER NOT NULL  , --冻存罐所在盒中位置
    label TEXT(255)   , --冻存罐标签
    cell_line TEXT(255)   , --细胞系
    modification TEXT(255)   , --修饰或处理
    catalog_no TEXT(255)   , --货号
    forzen_date TEXT(255)   , --冻存日期
    thaw_date TEXT(255)   , --复苏日期
    owner TEXT(255)   , --所有人
    remark TEXT(255)   , --备注
    PRIMARY KEY (cell_id)
)  ; --cell

DROP TABLE IF EXISTS box;
CREATE TABLE box(
    box_id INTEGER NOT NULL, --冻存盒ID
    position TEXT(255) NOT NULL  , --冻存盒位置
    storage_conditions TEXT NOT NULL  , --冻存盒储存条件
    name TEXT(255) NOT NULL  , --冻存盒名称
    label TEXT(255)   , --冻存盒标签
    PRIMARY KEY (box_id)
)  ; --box

DROP TABLE IF EXISTS antibody;
CREATE TABLE antibody(
    antibody_id INTEGER NOT NULL, --抗体ID
    name TEXT NOT NULL  , --抗体名称
    brand TEXT NOT NULL  , --品牌
    type TEXT NOT NULL  , --抗体类型
    catalog_no TEXT NOT NULL  , --货号
    host TEXT NOT NULL  , --宿主
    clone TEXT NOT NULL  , --克隆
    application TEXT NOT NULL  , --应用
    dilution TEXT NOT NULL  , --稀释度
    molecular_weight TEXT NOT NULL  , --分子量
    concentration TEXT NOT NULL  , --浓度
    link TEXT NOT NULL  , --链接
    lot_number TEXT NOT NULL  , --批号
    expiration_date TEXT NOT NULL  , --有效期
    storage_conditions TEXT NOT NULL  , --储存条件
    box_id INTEGER NOT NULL  , --冻存盒ID
    position TEXT NOT NULL  , --冻存盒位置
    PRIMARY KEY (antibody_id)
)  ; --antibody

INSERT INTO USER (username, realname, password, is_admin) VALUES ('admin', 'Admin', 'DKnNle5+P/ek6XYy8GYo5TtgZnAdDt2KsLiDVUG6Nhs=', '1');
INSERT INTO USER (username, password, is_admin) VALUES ('test', 'DKnNle5+P/ek6XYy8GYo5TtgZnAdDt2KsLiDVUG6Nhs=', '0');

INSERT INTO equipment (name, type) VALUES ('BSC', 'Tissue Culture');

INSERT INTO booking (uid, equipment_id, start_time, end_time) VALUES (1, 1, 1749787200000, 1749796200000);
INSERT INTO booking (uid, equipment_id, start_time, end_time) VALUES (1, 1, 1750147200000, 1750154400000);
INSERT INTO booking (uid, equipment_id, start_time, end_time) VALUES (1, 1, 1750485600000, 1750489200000);
INSERT INTO booking (uid, equipment_id, start_time, end_time) VALUES (2, 1, 1750573800000, 1750584600000);
INSERT INTO booking (uid, equipment_id, start_time, end_time) VALUES (1, 2, 1750485600000, 1750489200000);
INSERT INTO booking (uid, equipment_id, start_time, end_time, status) VALUES (1, 1, 1750147200000, 1750154400000, -1);