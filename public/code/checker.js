function checker() {
  var img = document.querySelector('img[src^="http://www.ruanyifeng.com/blog/images"]');
  if (img && window.getComputedStyle(img).display === 'none'){
    var sponsor = document.querySelector('.entry-sponsor');
    var prompt = document.createElement('div');
    prompt.style = 'border: 1px solid #c6c6c6;border-radius: 4px;background-color: #f5f2f0;padding: 15px; font-size: 16px;';
    prompt.innerHTML = '<p>鎮ㄤ娇鐢ㄤ簡骞垮憡鎷︽埅鍣紝瀵艰嚧鏈珯鍐呭鏃犳硶鏄剧ず銆�</p><p>璇峰皢 www.ruanyifeng.com 鍔犲叆鐧藉悕鍗曪紝瑙ｉ櫎骞垮憡灞忚斀鍚庯紝鍒锋柊椤甸潰锛岃阿璋€�</p>';
    sponsor.parentNode.replaceChild(prompt, sponsor);
    document.querySelector('#main-content').innerHTML = '';
  }
}

setTimeout(checker, 1000);