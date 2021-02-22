const fetch = require('node-fetch');
const {JSDOM} = require('jsdom');

const sleep = (msec) => new Promise(resolve => setTimeout(resolve, msec));

const getDateStr = (date) => {
  const YYYY = date.getFullYear();
	const MM = `0${date.getMonth()+1}`.slice(-2);
	const DD = `0${date.getDate()}`.slice(-2);
	const hh = `0${date.getHours()}`.slice(-2);
	const mm = `0${date.getMinutes()}`.slice(-2);

  return `${YYYY}/${MM}/${DD} ${hh}:${mm}`;
};

const fetchUsersInfoFromURL = async (url) => {
    const json = {};
    const res = await fetch(url).then(res => res.text());
    const dom = new JSDOM(res);
    const tds = dom.window.document.querySelectorAll('.table-responsive tr');
    tds.forEach((elem, index) => {
        if (index === 0) return;
        const name = elem.querySelector('.username').textContent.trim();
        const rating = parseInt(elem.children[3].textContent.trim());
        const numberOfCompetiton = parseInt(elem.children[5].textContent.trim());
        json[name] = {
            rating,
            numbers: numberOfCompetiton,
        }
    });
    return json;
};

(async () => {
    const res = await fetch('https://atcoder.jp/ranking').then(res => res.text());
    const dom = new JSDOM(res);
    const pageNum = parseInt(dom.window.document.querySelector('.pagination > li:last-of-type').textContent.trim());

    const json = {};
    for (let i = 1; i <= pageNum; ++i) {
        const ret = await fetchUsersInfoFromURL(`https://atcoder.jp/ranking?page=${i}`);
        Object.assign(json, ret);
				break;
        await sleep(100);
    }

    console.log(JSON.stringify({
			updated: getDateStr(new Date()),
			data: json,
		}));
})();
