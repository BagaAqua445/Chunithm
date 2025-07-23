<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <title>CHUNITHM 推分模擬器</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #f2f2f2; }
    h2 { margin-top: 30px; }
    button { margin: 5px; padding: 10px 15px; cursor: pointer; border: none; border-radius: 5px; background-color: #007bff; color: white; }
    button:hover { background-color: #0056b3; }
    textarea { width: 100%; height: 150px; margin-top: 10px; }
    pre { background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .section { background: #ffffff; padding: 20px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
    .rating-output { font-size: 18px; font-weight: bold; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>CHUNITHM 推分模擬器</h1>

  <div class="section">
    <h2>抓取成績資料</h2>
    <button onclick="fetchData('rating')">抓取 B30（舊版）</button>
    <button onclick="fetchData('rating2')">抓取 B20（新版）</button>
    <button onclick="mergeData()">合併 B30 + B20</button>
    <button onclick="clearDisplay()">清除顯示</button>
    <pre id="output">等待抓取...</pre>
    <button onclick="copyToClipboard()">📋 複製結果</button>
  </div>

  <div class="section">
    <h2>推分模擬</h2>
    <p>請輸入定數與預期分數，模擬該首曲目對 Rating 的影響：</p>
    <label>定數：<input type="number" id="level" step="0.1" min="1" max="15"></label><br><br>
    <label>分數：<input type="number" id="score" step="1" min="0" max="1010000"></label><br><br>
    <button onclick="simulateRating()">模擬推分</button>
    <p class="rating-output" id="simulated"></p>
  </div>

  <script>
    let b30 = [];
    let b20 = [];

    async function fetchData(type) {
      const url = `/mobile/rating/${type}.html`;
      try {
        const res = await fetch(url, { credentials: 'include' });
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const songs = Array.from(doc.querySelectorAll('.music_title')).map((el, i) => {
          const level = doc.querySelectorAll('.music_lv')[i].textContent.trim();
          const score = doc.querySelectorAll('.music_score_text')[i].textContent.trim();
          return {
            title: el.textContent.trim(),
            level: level,
            score: score
          };
        });

        if (type === 'rating') b30 = songs;
        else if (type === 'rating2') b20 = songs;

        document.getElementById('output').textContent = JSON.stringify(songs, null, 2);
      } catch (e) {
        document.getElementById('output').textContent = '❌ 抓取失敗，請確認是否已登入並同源開啟此工具頁面';
      }
    }

    function mergeData() {
      if (b30.length === 0 && b20.length === 0) {
        document.getElementById('output').textContent = '⚠️ 尚未抓取 B30 或 B20';
        return;
      }
      const combined = b30.concat(b20);
      document.getElementById('output').textContent = JSON.stringify(combined, null, 2);
    }

    function clearDisplay() {
      document.getElementById('output').textContent = '';
    }

    function copyToClipboard() {
      const text = document.getElementById('output').textContent;
      navigator.clipboard.writeText(text).then(() => alert("✅ 已複製到剪貼簿"));
    }

    function simulateRating() {
      const level = parseFloat(document.getElementById('level').value);
      const score = parseInt(document.getElementById('score').value);

      if (isNaN(level) || isNaN(score)) {
        document.getElementById('simulated').textContent = '⚠️ 請輸入有效的定數與分數';
        return;
      }

      let rating = 0;
      if (score >= 1007500) {
        rating = level + 2.0;
      } else if (score >= 1005000) {
        rating = level + 1.5 + (score - 1005000) / 5000 * 0.5;
      } else if (score >= 1000000) {
        rating = level + 1.0 + (score - 1000000) / 5000 * 0.5;
      } else if (score >= 975000) {
        rating = level + (score - 975000) / 25000;
      } else {
        rating = level - 3 + (score / 975000) * 3;
      }

      rating = Math.floor(rating * 100) / 100;
      document.getElementById('simulated').textContent = `該曲目預估 Rating：${rating}`;
    }
  </script>
</body>
</html>
