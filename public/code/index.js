
document.onreadystatechange = () => {
  console.log(new Date(), document.readyState);
}
window.onload = () => {
  console.log(new Date(), 'loaded...');
}

const doc = document;
const win = window;

function throttle(fn, delay, maxDelay) {
  let timer;
  let startTime = new Date();
  return function () {
    const context = this;
    const args = arguments;
    let curTime = new Date();
    clearTimeout(timer);
    if (curTime - startTime >= maxDelay) {
      fn.apply(context, args);
      startTime = curTime;
    } else {
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay);
    }
  }
}
const dImgList = [...doc.getElementsByTagName('img')];
function lazyLoadImg() {
  dImgList.forEach(dImg => {
    if (isVisible(dImg) && dImg.getAttribute('src') === '') {
      dImg.setAttribute('src', dImg.getAttribute('data-src'));
    }
  });
}
function isVisible(elem) {
  var rect = elem.getBoundingClientRect();
  return !(
    rect.top >= (window.innerHeight || document.documentElement.clientHeight) ||
    rect.left >= (window.innerWidth || document.documentElement.clientWidth) ||
    rect.bottom <= 0 ||
    rect.right <= 0
  );
}
win.onscroll = throttle(lazyLoadImg, 100, 150);

Promise.resolve(() => console.log('level 1'))
  .then(() => {
    console.log('level 2');
    return Promise.reject();
  })
  .then(() => console.log('level 3'))
  .catch(() => console.log('level 3 catch'))
  .then(() => console.log('level 4'))