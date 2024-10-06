const URL_TO_MATCH = /playlist\?list=WL/g;

const pVersion = document.getElementById('version');

const detailsGH = document.getElementById('details-gh');
const summaryGH = document.getElementById('summary-gh');
const btnFetchGhRepoInfo = document.getElementById('fetch-gh-repo-info');

const detailsYT = document.getElementById('details-yt');
const summaryYT = document.getElementById('summary-yt');
const btnFetchYTChannelInfo = document.getElementById('fetch-yt-channel-info');
const btnFetchYTWL = document.getElementById('fetch-yt-wl');
const btnDeleteYTWL = document.getElementById('delete-yt-wl');

const detailsBlog = document.getElementById('details-blog');
const summaryBlog = document.getElementById('summary-blog');
const btnFetchFreeCodeCampNews = document.getElementById('fetch-free-code-camp-news');
const btnMilanJovanovicBlog = document.getElementById('fetch-milan-jovanovic-blog');
const btnHackingWithSwiftBlog = document.getElementById('fetch-hackingwithswift-blog');
const btnYozmArticle = document.getElementById('fetch-yozm-article');

const labelArticlePath = document.getElementById('label-article-path');
const labeStatus = document.getElementById('status-lbl');
const btnCopyMessage = document.getElementById('copy-message'); 

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function makeIcon(faviconUrl) {
  return `<img class="icon" src="${faviconUrl}">`
}

document.addEventListener('DOMContentLoaded', () => {
  // Retrieve the manifest
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;
  pVersion.textContent = `Version: ${version}`;
  [
    btnFetchFreeCodeCampNews, btnMilanJovanovicBlog, btnHackingWithSwiftBlog, labelArticlePath
    ,btnYozmArticle , btnCopyMessage
  ].forEach((e) => {
    e.style.display = 'none';
  });
  summaryGH.classList.remove('activated')
  summaryYT.classList.remove('activated')
  summaryBlog.classList.remove('activated')
  
  getCurrentTab().then((tab) => {
    console.log("Current URL:", tab.url);

    if (/github\.com/g.test(tab.url)) {
      detailsGH.disabled = false;
      detailsGH.open = true;
      summaryGH.classList.add('activated')
      summaryGH.innerHTML = `${makeIcon("https://github.githubassets.com/favicons/favicon-dark.svg")}<span>github.com</span>`
      btnFetchGhRepoInfo.disabled = false
    }

    if (/youtube\.com/g.test(tab.url)) {
      detailsYT.disabled = false;
      detailsYT.open = true;
      detailsYT.style.background = 'rgba(234,51,35,0.2)'
      summaryYT.classList.add('activated')
      summaryYT.innerHTML = `${makeIcon("https://youtube.com/s/desktop/e6683cb8/img/favicon.ico")}<span>youtube.com</span>`
      if (URL_TO_MATCH.test(tab.url)) {
        btnFetchYTWL.disabled = false
        btnDeleteYTWL.disabled = false
      } else {
        btnFetchYTChannelInfo.disabled = false
      }
    }
    
    if (/freecodecamp\.org\/news/g.test(tab.url)) {
      detailsBlog.disabled = false;
      detailsBlog.open = true;
      detailsBlog.style.background = 'rgba(10,10,35,0.2)'
      summaryBlog.classList.add('activated')
      summaryBlog.innerHTML = `${makeIcon("https://cdn.freecodecamp.org/universal/favicons/favicon.ico")}<span>freeCodeCamp.org</span>`;
      btnFetchFreeCodeCampNews.disabled = false
      btnFetchFreeCodeCampNews.style.display = 'block';
    } else if (/milanjovanovic\.tech\/blog/g.test(tab.url)) {
      detailsBlog.disabled = false;
      detailsBlog.open = true;
      detailsBlog.style.background = 'rgba(79,70,229,0.2)'
      summaryBlog.classList.add('activated')
      summaryBlog.innerHTML = `${makeIcon("https://milanjovanovic.tech/profile_favicon.png")}<span>milanjovanovic.tech</span>`;
      btnMilanJovanovicBlog.disabled = false
      btnMilanJovanovicBlog.style.display = 'block';
    } else if (/hackingwithswift\.com\//g.test(tab.url)) {
      detailsBlog.disabled = false;
      detailsBlog.open = true;
      detailsBlog.style.background = 'rgba(174,10,10,0.2)'
      summaryBlog.classList.add('activated')
      summaryBlog.innerHTML = `${makeIcon("https://hackingwithswift.com/favicon.svg")}<span>hackingwithswift.com</span>`;
      btnHackingWithSwiftBlog.disabled = false
      btnHackingWithSwiftBlog.style.display = 'block';
      labelArticlePath.value = tab.url.replace(/https:\/\/www\.hackingwithswift\.com\//g, '')
    } else if (/yozm\.wishket\.com\//g.test(tab.url)) {
      detailsBlog.disabled = false;
      detailsBlog.open = true;
      detailsBlog.style.background = 'rgba(84,7,224,0.2)'
      summaryBlog.classList.add('activated')
      summaryBlog.innerHTML = `${makeIcon("https://yozm.wishket.com/static/renewal/img/global/gnb_yozmit.svg")}<span>yozm.wishket.com</span>`;
      btnYozmArticle.disabled = false
      btnYozmArticle.style.display = 'block';
    } else {
      summaryBlog.innerHTML = 'NOTHING TO DO ...';
    }
  });
});

btnFetchGhRepoInfo.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'FETCH_GH_REPO_INFO', repoPath: '', }, (res) => {
      labeStatus.classList.remove('fail')
      labeStatus.classList.remove('success')
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        labeStatus.classList.add('fail')
        labeStatus.innerHTML = chrome.runtime.lastError.message;
        return
      }
      console.log('Message sent successfully', res.o);
      labeStatus.classList.add('success')
      labeStatus.innerHTML = res.o.repo
      const langType = res.o.langType
      let comment = '// lang-'
      switch(langType) {
        case 'Java': comment += 'java';break;
        case 'JavaScript': comment += 'js';break;
        case 'TypeScript': comment += 'ts';break;
        case 'Python': comment += 'py';break;
        default:break;
      }
      delete res.o.langType;
      const str = `${JSON.stringify(res.o)}\n${comment}`.replace(/\}/g, '\n}')
                    .replace(/\"repo\":/g, '\n  \"repo\": ')
                    .replace(/\"desc\":/g, '\n  \"desc\": ')
                    .replace(/\"officialSite\":/g, '\n  \"officialSite\": ')
                    .replace(/\"topics\":/g, '\n  \"topics\": ')
                    .replace(/\"avatar\":/g, '\n  \"avatar\": ')
                    .replace(/\"banner\":/g, '\n  \"banner\": ')
                    .replace(/\",\"/g, '\", \"')
      copyToClipboard(str)
    })
  });
})

btnFetchYTChannelInfo.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'FETCH_YT_CHANNEL_INFO' }, (res) => {
      labeStatus.classList.remove('fail')
      labeStatus.classList.remove('success')
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        labeStatus.classList.add('fail')
        labeStatus.innerHTML = chrome.runtime.lastError.message;
        return
      }
      console.log('Message sent successfully', res.o);
      labeStatus.classList.add('success')
      labeStatus.innerHTML = res.o.channelId
      const str = `${JSON.stringify(res.o, null, 2).replace(/\[\]/g, '[\n\n  ]')}`
      copyToClipboard(str)
    });
  });
});

btnFetchYTWL.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'FETCH_WL' }, (res) => {
      labeStatus.classList.remove('fail')
      labeStatus.classList.remove('success')
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        labeStatus.classList.add('fail')
        labeStatus.innerHTML = chrome.runtime.lastError.message;
        return
      }
      console.log('Message sent successfully', res);
      labeStatus.classList.add('success')
      labeStatus.innerHTML = `Message sent successfully ... ${res.length}`
      copyToClipboard(JSON.stringify(res.videos))
    });
  });
});

/**
 * @name copyToClipboard
 * @description Function to copy text to clipboard
 * 
 * @param {string} text 
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Text copied to clipboard:', text);
  }).catch(err => {
    console.error('Failed to copy text:', err);
  });
}

btnDeleteYTWL.addEventListener('click', async () => {
  document.requestStorageAccessFor(window.location.origin).then(() => {
    console.log('Access granted');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'DELETE_WL' }, (res) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return
        }
        console.log('Message sent successfully', res);
      });
    });
  }).catch(err => {
    console.error('Access request failed:', err);
  });
});

btnFetchFreeCodeCampNews.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'FETCH_FREE_CODE_CAMP_NEWS' }, (res) => {
      labeStatus.classList.remove('fail')
      labeStatus.classList.remove('success')
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        labeStatus.classList.add('fail')
        labeStatus.innerHTML = chrome.runtime.lastError.message;
        return
      }
      console.log('Message sent successfully', res.o);
      labeStatus.classList.add('success')
      btnCopyMessage.disabled = false
      btnCopyMessage.style.display = 'block'
      labeStatus.innerHTML = res.o.filename
      copyToClipboard(res.o.text)
    });
  });
})

btnMilanJovanovicBlog.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'FETCH_MILAN_JOVANOVIC_BLOG' }, (res) => {
      labeStatus.classList.remove('fail')
      labeStatus.classList.remove('success')
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        labeStatus.classList.add('fail')
        labeStatus.innerHTML = chrome.runtime.lastError.message;
        return
      }
      console.log('Message sent successfully', res.o);
      labeStatus.classList.add('success')
      btnCopyMessage.disabled = false
      btnCopyMessage.style.display = 'block'
      labeStatus.innerHTML = res.o.filename;
      copyToClipboard(res.o.text)
    });
  });
})

btnHackingWithSwiftBlog.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { 
      type: 'FETCH_HACKING_WITH_SWIFT_BLOG', 
      path: labelArticlePath.value ?? '',
    }, (res) => {
      labeStatus.classList.remove('fail')
      labeStatus.classList.remove('success')
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        labeStatus.classList.add('fail')
        labeStatus.innerHTML = chrome.runtime.lastError.message;
        return
      }
      console.log('Message sent successfully', res.o);
      labeStatus.classList.add('success')
      btnCopyMessage.disabled = false
      btnCopyMessage.style.display = 'block'
      labeStatus.innerHTML = res.o.filename;
      copyToClipboard(res.o.text)
    });
  });
});

btnYozmArticle.addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'FETCH_YOZM_ARTICLE' }, (res) => {
      labeStatus.classList.remove('fail')
      labeStatus.classList.remove('success')
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        labeStatus.classList.add('fail')
        labeStatus.innerHTML = chrome.runtime.lastError.message;
        return
      }
      console.log('Message sent successfully', res.o);
      labeStatus.classList.add('success')
      btnCopyMessage.disabled = false
      btnCopyMessage.style.display = 'block'
      labeStatus.innerHTML = res.o.filename;
      copyToClipboard(res.o.text)
    });
  });
});

btnCopyMessage.addEventListener('click', async () => {
  copyToClipboard(labeStatus.textContent)
})