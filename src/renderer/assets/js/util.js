/**
 * Created by gokuai on 17/6/5.
 */

export default {
    // getMyDate(time){
    //     if (!time) return;
    //     let timeStan = (new Date(time)).valueOf();
    //     let dt = new Date(timeStan),
    //         Y = dt.getFullYear() + '-',
    //         M = (dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1) + '-',
    //         D = dt.getDate() + ' ',
    //         h = dt.getHours() + ':',
    //         m = dt.getMinutes() + ':',
    //         s = dt.getSeconds();
    //     let result = Y + M + D + h + m + s;
    //     return result;
    // }

}

module.export = function getmdate (time) {
  if (!time) return
  let timeStan = (new Date(time)).valueOf()
  let dt = new Date(timeStan),
    Y = dt.getFullYear() + '-',
    M = (dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1) + '-',
    D = dt.getDate() + ' ',
    h = dt.getHours() + ':',
    m = dt.getMinutes() + ':',
    s = dt.getSeconds()
  let result = Y + M + D + h + m + s
  return result
}
