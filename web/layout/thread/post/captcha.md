腾讯云验证码说明

###### 0 引入验证码SDK

​	import tcaptchs from '@common/utils/tcaptcha';

###### 1 - 1 根据后台管理权限是否开启，都开启时可以调用验证码

​	权限1：webConfig?.qcloud?.qcloudCaptcha

​	权限2：webConfig?.other?.createThreadWithCaptcha

###### 1- 2 且验证信息为空时，立刻调用

​	ticket  *// 腾讯云验证码返回票据*

 	randstr  *// 腾讯云验证码返回随机字符串*

###### 2 创建 验证码实例

​	new TencentCaptch（appId, callback(res)）

​	res.ret === 0	// 成功

​	res.ret === 2	// 关闭

###### 3 继续发布操作

​	（1）成功后，获取验证信息 —— 返回票据 和 返回随机字符串

​	（2）存到store里，然后清除验证信息

​	（3）继续发布



