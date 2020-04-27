/**
 * 
 * @param {DateString | DateNumber} Date 
 * @param {Function} fn
 * @example timeoutTask('2018-08-18T21:03:00', () => {});
 */
const timeoutTask = function (time, fn) {
    const tempDate = typeof time === 'number' ? time : Date.parse(time);
    const timer = setInterval(function () {
      let now = Date.now();
      if (now > tempDate) {
        fn && fn();
        clearInterval(timer);
      }
    }, 1000);
}
module.exports = timeoutTask;
// export default timeoutTask;