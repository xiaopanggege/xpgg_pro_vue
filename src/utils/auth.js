import Cookies from 'js-cookie'

// TokenKey是token的键名，这里容易造成误解，解释一下，下面的getToken里获取TokenKey即Cookies.get('jwt_token')是获取jwt_token的值，如果cookie里没有就是空了
// setToken里是对cookie的'jwt_token'赋值
const TokenKey = 'jwt_token'


export function getToken() {
  var inFifteenMinutes = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  // 如果要免登陆访问这里直接手动给token赋值，比如：'aaaa'，然后取消注释哈
  // Cookies.set('jwt_token', 'aaaa', {expires: inFifteenMinutes})
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  // 过期时间默认只能是天，下面这个可以设置到分钟，秒,1 * 60 * 1000表示1分钟
  var inFifteenMinutes = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  return Cookies.set('jwt_token', token, {expires: inFifteenMinutes})
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
