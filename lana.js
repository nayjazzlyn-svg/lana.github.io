var hamburgerBtn = document.getElementById('hamburgerBtn');
var mobileMenu = document.getElementById('mobileMenu');
var mobileBackdrop = document.getElementById('mobileMenuBackdrop');
var mobileMenuOpen = false;

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
  hamburgerBtn.classList.toggle('open', mobileMenuOpen);
  mobileMenu.classList.toggle('open', mobileMenuOpen);
  mobileBackdrop.classList.toggle('open', mobileMenuOpen);
  document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
}

function closeMobileMenu() {
  if (!mobileMenuOpen) return;
  mobileMenuOpen = false;
  hamburgerBtn.classList.remove('open');
  mobileMenu.classList.remove('open');
  mobileBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  toggleMobileMenu();
});
mobileBackdrop.addEventListener('click', function () {
  closeMobileMenu();
});

function mobileNavTo(target) {
  closeMobileMenu();
  setTimeout(function () {
    if (target === 'hero') backToHero();
    else showSection(target);
  }, mobileMenuOpen ? 350 : 0);
}

function updateMobileMenuCurrent(sectionId) {
  document.querySelectorAll('.mobile-menu-link[data-section]').forEach(
    function (link) {
      link.classList.toggle(
        'current',
        link.getAttribute('data-section') === sectionId
      );
    }
  );
}

var API_URL =
  'https://script.google.com/macros/s/AKfycbwdNcKeKTLALncNtZxJKmkBVOKYEGcJgzfr_ym9ug_QRXTFnyDv2GkeSLH3iKPmylus9Q/exec';

var GALLERY_FALLBACK = {};
var galleryData = JSON.parse(JSON.stringify(GALLERY_FALLBACK));
var SCHEDULE_DATA_FALLBACK = [];
var SCHEDULE_DATA = SCHEDULE_DATA_FALLBACK.slice();

var HASHTAG_DATA = [];
var HASHTAG_FALLBACK = [];
var HASHTAG_DISPLAY_LIMIT = 10;

var VIDEO_DATA = [];
var VIDEO_FALLBACK = [
  { id: 'dQw4w9WgXcQ', title: 'Perkenalan Lana JKT48' },
  { id: 'ScMzI-VBSF4', title: 'Showroom Lana JKT48' },
  { id: 'abc123def456', title: 'Behind the Scene Lana' }
];

var HISTORY_DATA = [];
var RULES_DATA = [];
var FAQ_DATA = [];
var REG_STATUS = { status: '', link: '' };

var ARTICLE_DATA = [];
var ARTICLE_FALLBACK = [];

var QUIZ_DATA = [];
var QUIZ_FALLBACK = [];
var quizScore = 0;
var quizAnswered = 0;
var currentQuizIdx = 0;
var quizSubmittedName = '';

var PROJECT_DATA = [];
var PROJECT_FALLBACK = [];

var BDAY_WISHES = [];
var countdownInterval = null;

var currentRescheduleType = null;
var currentRescheduleList = [];

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

function groupScheduleData(flatData) {
  var groups = {};
  flatData.forEach(function (row) {
    if (!groups[row.nama])
      groups[row.nama] = {
        name: row.nama,
        type: row.tipe,
        desc: row.deskripsi,
        schedule: []
      };
    groups[row.nama].schedule.push({
      date: row.tanggal,
      time: row.jam,
      unitSong: row.unitSong || row.unit_song || row.UnitSong || '',
      id: row.id
    });
  });
  return Object.values(groups);
}

function loadGallery() {
  return fetch(API_URL + '?action=readGallery&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (data.length > 0) {
        var grouped = {};
        data.forEach(function (row) {
          if (!grouped[row.folder])
            grouped[row.folder] = {
              tabKeys: [],
              tabLabels: {},
              images: {}
            };
          var folder = grouped[row.folder];
          if (folder.tabKeys.indexOf(row.album) === -1) {
            folder.tabKeys.push(row.album);
            folder.tabLabels[row.album] = row.label;
            folder.images[row.album] = [];
          }
          folder.images[row.album].push({
            src: row.src,
            alt: row.alt
          });
        });
        ['lana', 'lanautica'].forEach(function (folder) {
          if (!grouped[folder] && GALLERY_FALLBACK[folder])
            grouped[folder] = JSON.parse(
              JSON.stringify(GALLERY_FALLBACK[folder])
            );
        });
        galleryData = grouped;
      }
    })
    .catch(function () {
      galleryData = JSON.parse(JSON.stringify(GALLERY_FALLBACK));
    });
}

function loadSchedules() {
  return fetch(API_URL + '?action=read&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var grouped = groupScheduleData(data);
      if (grouped.length > 0) SCHEDULE_DATA = grouped;
    })
    .catch(function () {
      SCHEDULE_DATA = SCHEDULE_DATA_FALLBACK.slice();
    });
}

function loadHashtags() {
  return fetch(API_URL + '?action=readHashtags&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0)
        HASHTAG_DATA = data
          .map(function (row) {
            return {
              desc: row.desc || row.keterangan || '',
              tag: row.tag || row.hashtag || ''
            };
          })
          .filter(function (h) {
            return h.tag.length > 0;
          });
      else HASHTAG_DATA = HASHTAG_FALLBACK.slice();
    })
    .catch(function () {
      HASHTAG_DATA = HASHTAG_FALLBACK.slice();
    });
}

function loadVideos() {
  return fetch(API_URL + '?action=readVideos&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0)
        VIDEO_DATA = data
          .map(function (row) {
            return {
              id: row.videoId || row.id || '',
              title: row.title || row.judul || ''
            };
          })
          .filter(function (v) {
            return v.id.length > 0;
          });
      else VIDEO_DATA = VIDEO_FALLBACK.slice();
    })
    .catch(function () {
      VIDEO_DATA = VIDEO_FALLBACK.slice();
    });
}

function loadHistory() {
  return fetch(API_URL + '?action=readInfo&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0) {
        HISTORY_DATA = data
          .map(function (row) {
            return {
              section: (row.section || row.tipe || '').toLowerCase().trim(),
              title: row.title || row.judul || '',
              description: row.description || row.deskripsi || row.konten || '',
              photo: row.photo || row.foto || ''
            };
          })
          .filter(function (h) {
            return h.section.length > 0;
          });
      }
    })
    .catch(function () { });
}

function loadRules() {
  return fetch(API_URL + '?action=readPeraturan&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0)
        RULES_DATA = data
          .map(function (row) {
            return row.rule || row.peraturan || row.isi || '';
          })
          .filter(function (r) {
            return r.length > 0;
          });
    })
    .catch(function () { });
}

function loadFAQ() {
  return fetch(API_URL + '?action=readFaq&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0)
        FAQ_DATA = data
          .map(function (row) {
            return {
              question: row.question || row.pertanyaan || '',
              answer: row.answer || row.jawaban || ''
            };
          })
          .filter(function (f) {
            return f.question.length > 0;
          });
    })
    .catch(function () { });
}

function loadRegStatus() {
  return fetch(API_URL + '?action=readPendaftaran&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (data && (data.status || data.link)) {
        var statusStr = String(data.status || '').toLowerCase().trim();
        REG_STATUS = {
          status: statusStr === 'true' || statusStr === 'open',
          link: String(data.link || data.url || '').trim()
        };
      } else {
        REG_STATUS = { status: false, link: '' };
      }
    })
    .catch(function () {
      REG_STATUS = { status: false, link: '' };
    });
}


function loadArticles() {
  return fetch(API_URL + '?action=readArticles&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0) {
        ARTICLE_DATA = data
          .map(function (row) {
            return {
              id: row.id || row.row || '',
              title: row.title || row.judul || '',
              date: row.date || row.tanggal || '',
              author: row.author || row.penulis || '',
              excerpt: row.excerpt || row.ringkasan || '',
              content: row.content || row.isi || row.konten || '',
              thumbnail: row.thumbnail || row.foto || row.gambar || '',
              category: row.category || row.kategori || ''
            };
          })
          .filter(function (a) {
            return a.title.length > 0;
          });
      } else {
        ARTICLE_DATA = ARTICLE_FALLBACK.slice();
      }
    })
    .catch(function () {
      ARTICLE_DATA = ARTICLE_FALLBACK.slice();
    });
}

function loadQuiz() {
  return fetch(API_URL + '?action=readQuizzes&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0) {
        QUIZ_DATA = data
          .map(function (row) {
            return {
              id: row.id || row.row || '',
              question: row.question || row.pertanyaan || '',
              optionA: row.optionA || row.pilihanA || row.opsiA || '',
              optionB: row.optionB || row.pilihanB || row.opsiB || '',
              optionC: row.optionC || row.pilihanC || row.opsiC || '',
              optionD: row.optionD || row.pilihanD || row.opsiD || '',
              answer: (row.answer || row.jawaban || '').toUpperCase().trim()
            };
          })
          .filter(function (q) {
            return q.question.length > 0;
          });
      } else {
        QUIZ_DATA = QUIZ_FALLBACK.slice();
      }
    })
    .catch(function () {
      QUIZ_DATA = QUIZ_FALLBACK.slice();
    });
}

function loadProjects() {
  return fetch(API_URL + '?action=readProjects&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0) {
        PROJECT_DATA = data
          .map(function (row) {
            var rawStatus = (row.status || 'upcoming').toLowerCase().trim();
            var normalizedStatus = 'upcoming';
            if (rawStatus === 'selesai' || rawStatus === 'completed') {
              normalizedStatus = 'completed';
            } else if (rawStatus === 'ongoing') {
              normalizedStatus = 'ongoing';
            }

            return {
              id: row.id || row.row || '',
              title: row.nama || row.title || row.judul || '',
              date: row.date || row.tanggal || '',
              excerpt: row.deskripsi || row.excerpt || row.ringkasan || '',
              content: row.deskripsi || row.content || row.isi || row.konten || '',
              thumbnail: row.link || row.thumbnail || row.foto || row.gambar || '',
              photos: row.photos || row.galeri || row.dokumentasi || '',
              status: normalizedStatus
            };
          })
          .filter(function (p) {
            return p.title.length > 0;
          });
      } else {
        PROJECT_DATA = PROJECT_FALLBACK.slice();
      }
    })
    .catch(function () {
      PROJECT_DATA = PROJECT_FALLBACK.slice();
    });
}

function loadWishes() {
  return fetch(API_URL + '?action=readWishes&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data)) BDAY_WISHES = data;
      else BDAY_WISHES = [];
    })
    .catch(function () {
      BDAY_WISHES = [];
    });
}

var BULAN = {
  'januari': 0,
  'februari': 1,
  'maret': 2,
  'april': 3,
  'mei': 4,
  'juni': 5,
  'juli': 6,
  'agustus': 7,
  'september': 8,
  'oktober': 9,
  'november': 10,
  'desember': 11
};

function parseIDDate(str) {
  var s = str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  var parts = s.split(/\s+/);
  if (parts.length < 3) return new Date(2000, 0, 1);
  var d = parseInt(parts[0], 10),
    m = BULAN[parts[1]],
    y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return new Date(2000, 0, 1);
  return new Date(y, m, d);
}

function todayAt() {
  var n = new Date();
  n.setHours(0, 0, 0, 0);
  return n.getTime();
}
function isFuture(dateStr) {
  return parseIDDate(dateStr).getTime() >= todayAt();
}
function isTodayCheck(dateStr) {
  return parseIDDate(dateStr).getTime() === todayAt();
}

function isTimePassed(dateStr, timeStr) {
  var scheduleDate = parseIDDate(dateStr);
  var now = new Date();
  var todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (scheduleDate.getTime() < todayStart.getTime()) return true;
  if (scheduleDate.getTime() > todayStart.getTime()) return false;
  if (!timeStr) return false;
  var cleanTime = timeStr
    .replace(/[.]/g, ':')
    .replace(/[^\d:]/g, '')
    .trim();
  var parts = cleanTime.split(':');
  var hours = parseInt(parts[0], 10);
  var minutes = parseInt(parts[1], 10) || 0;
  if (isNaN(hours)) return false;
  return (
    now.getHours() > hours ||
    (now.getHours() === hours && now.getMinutes() >= minutes)
  );
}

function splitSchedule() {
  var upcoming = [];
  var completed = [];
  SCHEDULE_DATA.forEach(function (item) {
    var futureSched = [];
    var pastSched = [];
    item.schedule.forEach(function (s) {
      if (isFuture(s.date)) futureSched.push(s);
      else pastSched.push(s);
    });
    if (futureSched.length > 0)
      upcoming.push({
        name: item.name,
        type: item.type,
        desc: item.desc,
        schedule: futureSched,
        allSchedule: item.schedule
      });
    if (pastSched.length > 0)
      completed.push({
        name: item.name,
        type: item.type,
        desc: item.desc,
        schedule: pastSched
      });
  });
  return { upcoming: upcoming, completed: completed };
}

function toSafeClass(typeStr) {
  if (!typeStr) return '';
  var t = typeStr.toLowerCase().trim().replace(/[\s\.]+/g, '-');
  if (t === 'theater' || t === 'teather') t = 'teater';
  if (/^[0-9]/.test(t)) t = 't-' + t;
  return t;
}

function renderSchedule() {
  var split = splitSchedule();
  var allEntries = [];
  split.upcoming.forEach(function (group) {
    group.schedule.forEach(function (s) {
      allEntries.push({ group: group, s: s });
    });
  });
  allEntries.sort(function (a, b) {
    return parseIDDate(b.s.date).getTime() - parseIDDate(a.s.date).getTime();
  });

  var rows = [];
  var upcomingCount = 0;
  var todayCount = 0;
  var doneTodayCount = 0;
  allEntries.forEach(function (entry) {
    var group = entry.group;
    var s = entry.s;
    var isT = isTodayCheck(s.date);
    var timePassed = isTimePassed(s.date, s.time);
    if (isT && !timePassed) todayCount++;
    else if (isT && timePassed) doneTodayCount++;
    else if (!timePassed) upcomingCount++;
    var statusCls, statusTxt;
    if (isT && !timePassed) {
      statusCls = 'today';
      statusTxt = 'Hari Ini';
    } else if (timePassed) {
      statusCls = 'done';
      statusTxt = 'Selesai';
    } else {
      statusCls = 'upcoming';
      statusTxt = 'Mendatang';
    }
    var infoDisplay, infoCls;
    if (timePassed && s.unitSong) {
      infoDisplay = s.unitSong;
      infoCls = 'sched-unitsong';
    } else {
      infoDisplay = s.time;
      infoCls = 'sched-time';
    }
    var rowDoneClass = timePassed ? ' sched-row-done' : '';
    rows.push(
      '<div class="sched-row sched-type-' +
      toSafeClass(group.type) +
      rowDoneClass +
      '"><span class="sched-no">' +
      (rows.length + 1) +
      '</span><span class="sched-name"><span class="sched-name-dot"></span><span class="sched-name-text">' +
      group.name +
      '</span></span><span class="sched-date">' +
      s.date +
      '</span><span class="' +
      infoCls +
      '">' +
      infoDisplay +
      '</span><span class="sched-status-wrap"><span class="sched-status ' +
      statusCls +
      '">' +
      statusTxt +
      '</span></span></div>'
    );
  });
  var totalCompleted = 0;
  split.completed.forEach(function (g) {
    totalCompleted += g.schedule.length;
  });
  document.getElementById('schedSummary').innerHTML =
    '<div class="sched-summary-chip"><span class="sched-summary-dot upcoming"></span><strong>' +
    upcomingCount +
    '</strong> Mendatang</div>' +
    (todayCount > 0
      ? '<div class="sched-summary-chip"><span class="sched-summary-dot today"></span><strong>' +
      todayCount +
      '</strong> Hari Ini</div>'
      : '') +
    (doneTodayCount > 0
      ? '<div class="sched-summary-chip"><strong>' +
      doneTodayCount +
      '</strong> Selesai</div>'
      : '') +
    '<div class="sched-summary-chip"><strong>' +
    totalCompleted +
    '</strong> Selesai → Reschedule</div>';
  document.getElementById('schedContent').innerHTML =
    rows.length === 0
      ? '<div class="sched-empty">Belum ada schedule mendatang.</div>'
      : rows.join('');
}

function renderReschedule() {
  var split = splitSchedule();
  var list = split.completed;
  list.sort(function (a, b) {
    var lastA = a.schedule.reduce(function (max, s) {
      return parseIDDate(s.date).getTime() > max
        ? parseIDDate(s.date).getTime()
        : max;
    }, 0);
    var lastB = b.schedule.reduce(function (max, s) {
      return parseIDDate(s.date).getTime() > max
        ? parseIDDate(s.date).getTime()
        : max;
    }, 0);
    return lastB - lastA;
  });

  var typeCounts = {
    teater: 0,
    event: 0,
    digital: 0,
    concert: 0,
    'off-air-event': 0,
    vc: 0,
    't-2shoot': 0,
    'm-g': 0
  };
  list.forEach(function (g) {
    var t = toSafeClass(g.type);
    if (typeCounts.hasOwnProperty(t)) {
      typeCounts[t] += g.schedule.length;
    }
  });

  var typeColors = {
    teater: 'var(--accent)',
    event: '#f5b23c',
    digital: '#5eead4',
    concert: '#c084fc',
    'off-air-event': '#fb923c',
    vc: '#38bdf8',
    't-2shoot': '#f472b6',
    'm-g': '#a3e635'
  };
  var typeLabels = {
    teater: 'Teater',
    event: 'Event',
    digital: 'Digital',
    concert: 'Concert',
    'off-air-event': 'Off Air Event',
    vc: 'VC',
    't-2shoot': '2shoot',
    'm-g': 'M&G'
  };

  var el = document.getElementById('rescheduleCategoryList');
  var html = '';
  var delay = 0;
  for (var key in typeLabels) {
    var count = typeCounts[key];
    html +=
      '<div class="reschedule-category-item" style="transition-delay:' +
      delay * 80 +
      'ms" onclick="showRescheduleCategory(\'' +
      key +
      '\')">';
    html +=
      '<span class="reschedule-category-dot" style="background:' +
      typeColors[key] +
      '"></span>';
    html +=
      '<div class="reschedule-category-info"><div class="reschedule-category-name">' +
      typeLabels[key] +
      '</div><div class="reschedule-category-count">' +
      count +
      ' jadwal selesai</div></div>';
    html += '<span class="reschedule-category-val">' + count + '</span>';
    html +=
      '<svg class="reschedule-category-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
    html += '</div>';
    delay++;
  }

  el.innerHTML = html;
  setTimeout(function () {
    el.querySelectorAll('.reschedule-category-item').forEach(function (it, i) {
      setTimeout(function () {
        it.classList.add('visible');
      }, i * 80);
    });
  }, 50);
}

function showRescheduleCategory(type) {
  var split = splitSchedule();
  var list = split.completed;
  list.sort(function (a, b) {
    var lastA = a.schedule.reduce(function (max, s) {
      return parseIDDate(s.date).getTime() > max
        ? parseIDDate(s.date).getTime()
        : max;
    }, 0);
    var lastB = b.schedule.reduce(function (max, s) {
      return parseIDDate(s.date).getTime() > max
        ? parseIDDate(s.date).getTime()
        : max;
    }, 0);
    return lastB - lastA;
  });

  var filtered;
  var categoryTitle;
  var typeLabels = {
    teater: 'Teater',
    event: 'Event',
    digital: 'Digital',
    concert: 'Concert',
    'off-air-event': 'Off Air Event',
    vc: 'VC',
    't-2shoot': '2shoot',
    'm-g': 'M&G'
  };

  if (type === null) {
    filtered = list;
    categoryTitle = 'Total Reschedule';
  } else {
    filtered = list.filter(function (g) {
      return toSafeClass(g.type) === type;
    });
    categoryTitle = typeLabels[type] || type;
  }

  currentRescheduleType = type;
  currentRescheduleList = filtered;
  document.getElementById('rescheduleListView').classList.remove('active');
  var sv = document.getElementById('rescheduleShowListView');
  sv.classList.add('active');

  var html =
    '<div class="section-header"><button class="back-btn" onclick="closeRescheduleShowList()" aria-label="Kembali"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h2>' +
    categoryTitle +
    '</h2></div>';
  if (filtered.length === 0) {
    html +=
      '<div class="sched-empty">Belum ada jadwal yang selesai untuk kategori ini.</div>';
  } else {
    html += '<div class="reschedule-list">';
    filtered.forEach(function (item, idx) {
      var sortedSched = item.schedule
        .slice()
        .sort(function (a, b) {
          return (
            parseIDDate(b.date).getTime() - parseIDDate(a.date).getTime()
          );
        });
      var lastDate = sortedSched[0].date;
      var safeType = toSafeClass(item.type);
      html +=
        '<div class="reschedule-item" style="transition-delay:' +
        idx * 80 +
        'ms"><div class="reschedule-item-header" onclick="showRescheduleDetailByType(' +
        idx +
        ')"><span class="reschedule-type-badge ' +
        safeType +
        '">' +
        item.type +
        '</span><div class="reschedule-item-info"><div class="reschedule-item-name">' +
        item.name +
        '</div><div class="reschedule-item-date">' +
        item.schedule.length +
        ' jadwal &middot; terakhir ' +
        lastDate +
        '</div></div><svg class="reschedule-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>';
    });
    html += '</div>';
  }
  sv.innerHTML = html;
  setTimeout(function () {
    sv.querySelectorAll('.reschedule-item').forEach(function (it, i) {
      setTimeout(function () {
        it.classList.add('visible');
      }, i * 80);
    });
  }, 50);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showRescheduleDetailByType(idx) {
  var item = currentRescheduleList[idx];
  if (!item) return;
  document.getElementById('rescheduleShowListView').classList.remove('active');
  var dv = document.getElementById('rescheduleDetailView');
  dv.classList.add('active');
  var typeLabel = item.type;
  var safeType = toSafeClass(item.type);
  var sortedSchedule = item.schedule
    .slice()
    .sort(function (a, b) {
      return parseIDDate(b.date).getTime() - parseIDDate(a.date).getTime();
    });
  var rows = '';
  sortedSchedule.forEach(function (s) {
    rows +=
      '<div class="detail-table-row row-done"><span class="detail-table-date date-done">' +
      s.date +
      '</span><span class="detail-table-unitsong">' +
      (s.unitSong || '-') +
      '</span></div>';
  });
  dv.innerHTML =
    '<div class="section-header"><button class="back-btn" onclick="closeRescheduleDetail()" aria-label="Kembali"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h2>' +
    item.name +
    '</h2></div><div class="detail-hero"><div class="detail-hero-top"><div class="detail-hero-name">' +
    item.name +
    '</div><span class="reschedule-type-badge ' +
    safeType +
    '" style="margin-top:8px;display:inline-flex">' +
    typeLabel +
    '</span></div><div class="detail-hero-desc">' +
    item.desc +
    '</div></div><div class="detail-stats"><div class="detail-stat"><div class="detail-stat-value">' +
    item.schedule.length +
    '</div><div class="detail-stat-label">Total Jadwal</div></div><div class="detail-stat"><div class="detail-stat-value">' +
    item.schedule.length +
    '</div><div class="detail-stat-label">Selesai</div></div><div class="detail-stat"><div class="detail-stat-value">0</div><div class="detail-stat-label">Tersisa</div></div></div><div class="detail-table-wrap"><div class="detail-table-header"><span>Tanggal</span><span>Unit Song</span></div>' +
    rows +
    '</div>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeRescheduleDetail() {
  document.getElementById('rescheduleDetailView').classList.remove('active');
  document.getElementById('rescheduleDetailView').innerHTML = '';
  document.getElementById('rescheduleShowListView').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeRescheduleShowList() {
  document.getElementById('rescheduleShowListView').classList.remove('active');
  document.getElementById('rescheduleShowListView').innerHTML = '';
  document.getElementById('rescheduleListView').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeRescheduleAllViews() {
  document.getElementById('rescheduleDetailView').classList.remove('active');
  document.getElementById('rescheduleDetailView').innerHTML = '';
  document.getElementById('rescheduleShowListView').classList.remove('active');
  document.getElementById('rescheduleShowListView').innerHTML = '';
  document.getElementById('rescheduleListView').classList.add('active');
}

function renderHashtags() {
  var displayData = HASHTAG_DATA.slice(0, HASHTAG_DISPLAY_LIMIT);
  var html = '';
  displayData.forEach(function (h, i) {
    html +=
      '<div class="hashtag-row"><span class="hashtag-no">' +
      (i + 1) +
      '</span><span class="hashtag-desc"><em>' +
      h.desc +
      '</em></span><span class="hashtag-tag"><span class="hashtag-hash">#</span>' +
      h.tag +
      '</span></div>';
  });
  document.getElementById('hashtagContent').innerHTML = html;
  var seeMoreWrap = document.getElementById('hashtagSeeMoreWrap');
  if (HASHTAG_DATA.length > HASHTAG_DISPLAY_LIMIT) {
    seeMoreWrap.innerHTML =
      '<button class="hashtag-see-more" onclick="showSection(\'hashtags\')">Selengkapnya <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg> <span style="opacity:.6;font-weight:400">(' +
      (HASHTAG_DATA.length - HASHTAG_DISPLAY_LIMIT) +
      ' lagi)</span></button>';
  } else {
    seeMoreWrap.innerHTML = '';
  }
}

function renderHashtagPage(filter) {
  var data = HASHTAG_DATA;
  if (filter && filter.trim().length > 0) {
    var q = filter.toLowerCase().trim();
    data = data.filter(function (h) {
      return (
        h.tag.toLowerCase().indexOf(q) !== -1 ||
        h.desc.toLowerCase().indexOf(q) !== -1
      );
    });
  }
  document.getElementById('htTotalBadge').textContent = HASHTAG_DATA.length;
  var grid = document.getElementById('htGrid');
  if (data.length === 0) {
    grid.innerHTML = '<div class="ht-empty">Tidak ada hashtag ditemukan.</div>';
    return;
  }
  var html = '';
  data.forEach(function (h, i) {
    var delay = Math.min(i * 50, 600);
    var escapedTag = h.tag.replace(/'/g, "\\'");
    html +=
      '<div class="ht-card" style="transition-delay:' +
      delay +
      'ms"><div class="ht-card-no">' +
      (i + 1) +
      '</div><div class="ht-card-info"><div class="ht-card-desc">' +
      h.desc +
      '</div></div><div class="ht-card-tag-wrap" onclick="copyHashtag(this, \'' +
      escapedTag +
      '\')" title="Klik untuk salin"><span class="ht-copy-hint">Tersalin!</span><span class="ht-card-tag"><span class="ht-card-hash">#</span>' +
      h.tag +
      '</span></div></div>';
  });
  grid.innerHTML = html;
  setTimeout(function () {
    grid.querySelectorAll('.ht-card').forEach(function (c, idx) {
      setTimeout(function () {
        c.classList.add('visible');
      }, idx * 50);
    });
  }, 60);
}

function filterHashtags() {
  renderHashtagPage(document.getElementById('htSearch').value);
}
function copyHashtag(el, tag) {
  var fullTag = '#' + tag;
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(fullTag);
  else {
    var ta = document.createElement('textarea');
    ta.value = fullTag;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  var hint = el.querySelector('.ht-copy-hint');
  if (hint) {
    hint.classList.add('show');
    setTimeout(function () {
      hint.classList.remove('show');
    }, 1200);
  }
}

function computeUnitSongs() {
  var songCounts = {};
  SCHEDULE_DATA.forEach(function (group) {
    group.schedule.forEach(function (s) {
      if (s.unitSong && s.unitSong.trim()) {
        var rawSongs = s.unitSong.replace(/\r\n/g, '\n').split(/[\n,]|&/);
        rawSongs.forEach(function (raw) {
          var song = raw.trim();
          if (song.length > 0) {
            songCounts[song] = (songCounts[song] || 0) + 1;
          }
        });
      }
    });
  });
  var result = [];
  for (var song in songCounts) {
    result.push({ song: song, count: songCounts[song] });
  }
  result.sort(function (a, b) {
    return b.count - a.count;
  });
  return result;
}

var unitSongScrollInterval = null;

function renderUnitSongs() {
  var data = computeUnitSongs();
  var grid = document.getElementById('unitSongGrid');
  if (data.length === 0) {
    grid.innerHTML = '<div class="unitsong-empty">Belum ada unit song tercatat.</div>';
    return;
  }
  var html = '';
  data.forEach(function (item, i) {
    html +=
      '<div class="unitsong-card"><div class="unitsong-icon"><svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div><div class="unitsong-name" title="' +
      escapeHtml(item.song) +
      '">' +
      escapeHtml(item.song) +
      '</div><div class="unitsong-count">Dibawakan: <strong>' +
      item.count +
      'x</strong></div></div>';
  });
  grid.innerHTML = html;
  if (grid.scrollWidth > grid.clientWidth) {
    grid.innerHTML = html + html;
  }
  setTimeout(function () {
    grid.querySelectorAll('.unitsong-card').forEach(function (c, idx) {
      setTimeout(function () {
        c.classList.add('visible');
      }, idx * 60);
    });
  }, 60);
  initUnitSongSlider();
}

function initUnitSongSlider() {
  var container = document.getElementById('unitSongGrid');
  if (!container) return;
  if (unitSongScrollInterval) clearInterval(unitSongScrollInterval);
  if (container.scrollWidth <= container.clientWidth) return;
  var singleSetWidth = container.scrollWidth / 2;
  container.scrollLeft = 0;
  container.onmouseenter = function () {
    if (unitSongScrollInterval) clearInterval(unitSongScrollInterval);
  };
  container.onmouseleave = function () {
    startAutoScroll();
  };
  function startAutoScroll() {
    if (unitSongScrollInterval) clearInterval(unitSongScrollInterval);
    unitSongScrollInterval = setInterval(function () {
      if (container.scrollLeft >= singleSetWidth) {
        container.scrollLeft -= singleSetWidth;
      }
      container.scrollLeft += 1;
    }, 30);
  }
  startAutoScroll();
}

function renderVideoPreview() {
  if (VIDEO_DATA.length === 0) {
    document.getElementById('videoFeatured').innerHTML = '';
    document.getElementById('videoSmallGrid').innerHTML = '';
    document.getElementById('videoSeeMoreWrap').innerHTML = '';
    return;
  }
  var featured = VIDEO_DATA[0];
  document.getElementById('videoFeatured').innerHTML =
    '<div class="video-featured-card"><div class="video-featured-wrap" style="position:relative;cursor:pointer" onclick="openYtPopup(\'' + featured.id + '\')"><img src="https://img.youtube.com/vi/' + featured.id + '/maxresdefault.jpg" alt="' + escapeHtml(featured.title) + '" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0" onerror="this.src=\'https://img.youtube.com/vi/' + featured.id + '/hqdefault.jpg\'"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:68px;height:48px;background:red;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.5)"><svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:white;stroke:none"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div><div class="video-featured-info"><div class="video-featured-label">Video Perkenalan</div><div class="video-featured-title">' +
    escapeHtml(featured.title) +
    '</div></div></div>';

  var smallVids = VIDEO_DATA.slice(1, 3);
  var smallHtml = '';
  smallVids.forEach(function (v) {
    smallHtml +=
      '<div class="video-small-card" onclick="openYtPopup(\'' + v.id + '\')" style="cursor:pointer"><div class="video-small-thumb" style="position:relative"><img src="https://img.youtube.com/vi/' +
      v.id +
      '/hqdefault.jpg" alt="' +
      escapeHtml(v.title) +
      '" loading="lazy"><div class="video-small-play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div><div class="video-small-info"><div class="video-small-title">' +
      escapeHtml(v.title) +
      '</div></div></div>';
  });
  document.getElementById('videoSmallGrid').innerHTML = smallHtml;

  var seeMoreWrap = document.getElementById('videoSeeMoreWrap');
  if (VIDEO_DATA.length > 3) {
    seeMoreWrap.innerHTML =
      '<button class="video-see-more" onclick="showSection(\'videos\')">Selengkapnya <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg> <span style="opacity:.6;font-weight:400">(' +
      (VIDEO_DATA.length - 3) +
      ' lagi)</span></button>';
  } else if (VIDEO_DATA.length > 1) {
    seeMoreWrap.innerHTML =
      '<button class="video-see-more" onclick="showSection(\'videos\')">Selengkapnya <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>';
  } else {
    seeMoreWrap.innerHTML = '';
  }
}

function playSmallVideo(card, videoId) {
  var thumbWrap = card.querySelector('.video-small-thumb');
  thumbWrap.innerHTML =
    '<iframe src="https://www.youtube.com/embed/' +
    videoId +
    '?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"></iframe>';
}

function renderVideoPage() {
  document.getElementById('vidTotalBadge').textContent = VIDEO_DATA.length;
  var grid = document.getElementById('vidPageGrid');
  if (VIDEO_DATA.length === 0) {
    grid.innerHTML = '<div class="vid-page-empty">Belum ada video tersedia.</div>';
    return;
  }
  var html = '';
  VIDEO_DATA.forEach(function (v, i) {
    var delay = Math.min(i * 80, 600);
    html +=
      '<div class="vid-page-card" style="transition-delay:' +
      delay +
      'ms"><div class="vid-page-embed" style="position:relative;cursor:pointer" onclick="openYtPopup(\'' + v.id + '\')"><img src="https://img.youtube.com/vi/' + v.id + '/hqdefault.jpg" alt="' +
      escapeHtml(v.title) +
      '" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0" loading="lazy"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:68px;height:48px;background:red;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.5)"><svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:white;stroke:none"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div><div class="vid-page-info"><div class="vid-page-card-title">' +
      escapeHtml(v.title) +
      '</div></div></div>';
  });
  grid.innerHTML = html;
  setTimeout(function () {
    grid.querySelectorAll('.vid-page-card').forEach(function (c, idx) {
      setTimeout(function () {
        c.classList.add('visible');
      }, idx * 80);
    });
  }, 60);
}

function goToBirthday() {
  showSection('birthday');
  startCountdown();
  loadWishes().then(function () {
    renderBdayCards();
  });
}

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  function update() {
    var now = new Date();
    var year = now.getFullYear();
    var target = new Date(year, 8, 14, 0, 0, 0);
    if (now > target) target = new Date(year + 1, 8, 14, 0, 0, 0);
    var diff = target - now;
    var isBirthdayToday = now.getMonth() === 8 && now.getDate() === 14;
    var sectionEl = document.getElementById('birthday');
    if (isBirthdayToday) {
      sectionEl.classList.add('is-bday-today');
      document.getElementById('cdMsg').textContent =
        'Selamat Ulang Tahun, Aurhel Alana! ✨';
    } else {
      sectionEl.classList.remove('is-bday-today');
      document.getElementById('cdMsg').textContent =
        'Menuju hari istimewanya Lana ✨';
      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var secs = Math.floor((diff % (1000 * 60)) / 1000);
      document.getElementById('cdDays').textContent =
        days < 10 ? '0' + days : days;
      document.getElementById('cdHours').textContent =
        hours < 10 ? '0' + hours : hours;
      document.getElementById('cdMins').textContent =
        mins < 10 ? '0' + mins : mins;
      document.getElementById('cdSecs').textContent =
        secs < 10 ? '0' + secs : secs;
    }
  }
  update();
  countdownInterval = setInterval(update, 1000);
}

function renderBdayCards() {
  var wall = document.getElementById('bdayWall');
  if (BDAY_WISHES.length === 0) {
    wall.innerHTML =
      '<div class="bday-empty">Belum ada ucapan. Jadilah yang pertama!</div>';
    return;
  }
  var html = '';
  var sortedWishes = BDAY_WISHES.slice().reverse();
  sortedWishes.forEach(function (w, i) {
    var delay = Math.min(i * 80, 600);
    html +=
      '<div class="bday-card" style="animation-delay:' +
      delay +
      'ms"><div class="bday-card-name">' +
      escapeHtml(w.nama) +
      '</div><div class="bday-card-msg">' +
      escapeHtml(w.pesan) +
      '</div></div>';
  });
  wall.innerHTML = html;
}

function openBdayModal() {
  document.getElementById('bdayModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeBdayModal() {
  document.getElementById('bdayModal').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('bdayInputName').value = '';
  document.getElementById('bdayInputMsg').value = '';
}

function submitBdayCard() {
  var name = document.getElementById('bdayInputName').value.trim();
  var msg = document.getElementById('bdayInputMsg').value.trim();
  if (!name || !msg) {
    alert('Nama dan ucapan tidak boleh kosong ya~');
    return;
  }
  fetch(API_URL, {
    method: 'POST',
    redirect: 'follow',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'addWish', nama: name, pesan: msg })
  })
    .then(function (res) {
      closeBdayModal();
      loadWishes().then(function () {
        renderBdayCards();
      });
      alert('Ucapan berhasil dikirim! ✨');
    })
    .catch(function () {
      alert('Terjadi kesalahan jaringan.');
    });
}

function renderHistoryPage() {
  var sejarahItems = HISTORY_DATA.filter(function (item) {
    return item.section === 'sejarah';
  });
  var logoItem = HISTORY_DATA.find(function (item) {
    return item.section === 'makna';
  });
  var mottoItem = HISTORY_DATA.find(function (item) {
    return item.section === 'motto';
  });
  var html = '';
  if (sejarahItems.length > 0) {
    html +=
      '<div class="history-section"><div class="history-section-divider"><span>Sejarah</span></div><div class="history-timeline">';
    sejarahItems.forEach(function (item, i) {
      var hasPhoto = item.photo && item.photo.trim();
      html +=
        '<div class="history-tl-item' +
        (hasPhoto ? ' has-photo' : '') +
        '" style="transition-delay:' +
        i * 100 +
        'ms"><div class="history-tl-dot"></div><div class="history-tl-card">' +
        (hasPhoto
          ? '<div class="history-tl-photo"><img src="' +
          item.photo +
          '" alt="' +
          escapeHtml(item.title) +
          '" loading="lazy"></div>'
          : '') +
        '<div class="history-tl-text"><div class="history-tl-title">' +
        escapeHtml(item.title) +
        '</div><div class="history-tl-desc">' +
        escapeHtml(item.description) +
        '</div></div></div></div>';
    });
    html += '</div></div>';
  }
  if (logoItem) {
    html +=
      '<div class="history-section"><div class="history-section-divider"><span>Makna Logo</span></div><div class="history-logo-block">';
    if (logoItem.photo && logoItem.photo.trim()) {
      html +=
        '<div class="history-logo-img-wrap"><div class="history-logo-glow"></div><img src="' +
        logoItem.photo +
        '" alt="Logo LANAUTICA"></div>';
    }
    html +=
      '<div class="history-logo-text"><div class="history-logo-title">' +
      escapeHtml(logoItem.title) +
      '</div><p>' +
      escapeHtml(logoItem.description) +
      '</p></div></div></div>';
  }
  if (mottoItem) {
    html +=
      '<div class="history-section"><div class="history-section-divider"><span>Motto</span></div><div class="history-motto-card"><span class="history-motto-mark">"</span><p>' +
      escapeHtml(mottoItem.description) +
      '</p><span class="history-motto-source">— ' +
      escapeHtml(mottoItem.title) +
      ' ☾</span></div></div>';
  }
  if (!html) {
    html =
      '<div class="history-empty">Belum ada konten sejarah yang ditambahkan oleh Admin.</div>';
  }
  document.getElementById('historyPageContent').innerHTML = html;
  setTimeout(function () {
    document.querySelectorAll('.history-tl-item').forEach(function (item, i) {
      setTimeout(function () {
        item.classList.add('visible');
      }, i * 100);
    });
  }, 60);
}

function renderRulesModal() {
  var el = document.getElementById('rulesTableContent');
  if (RULES_DATA.length === 0) {
    el.innerHTML =
      '<div class="rules-empty">Belum ada peraturan yang ditambahkan oleh Admin.</div>';
    return;
  }
  var html =
    '<table class="rules-table"><thead><tr><th>No</th><th>Peraturan</th></tr></thead><tbody>';
  RULES_DATA.forEach(function (rule, i) {
    html +=
      '<tr><td>' +
      (i + 1) +
      '</td><td>' +
      escapeHtml(rule) +
      '</td></tr>';
  });
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderFAQ() {
  var el = document.getElementById('fbFaqList');
  if (FAQ_DATA.length === 0) {
    el.innerHTML =
      '<div class="rules-empty">Belum ada FAQ yang ditambahkan oleh Admin.</div>';
    return;
  }
  var html = '';
  FAQ_DATA.forEach(function (faq) {
    html +=
      '<div class="fb-faq-item"><button class="fb-faq-question" onclick="toggleFaq(this)">' +
      escapeHtml(faq.question) +
      '<svg class="fb-faq-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></button><div class="fb-faq-answer"><p>' +
      escapeHtml(faq.answer) +
      '</p></div></div>';
  });
  el.innerHTML = html;
}

function renderRegStatus() {
  var el = document.getElementById('fbRegSection');
  var isOpen = REG_STATUS.status === true || String(REG_STATUS.status).toLowerCase().trim() === 'true' || String(REG_STATUS.status).toLowerCase().trim() === 'open';

  if (!isOpen) {
    el.innerHTML =
      '<div class="fb-reg-card"><div class="fb-reg-title"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> Pendaftaran Member</div><div class="fb-reg-status closed"><span class="fb-reg-dot"></span>Belum Tersedia</div><button class="fb-reg-btn closed" disabled>Info Pendaftaran Belum Ada</button></div>';
    return;
  }

  var statusLabel = 'Open';
  var statusClass = 'open';
  var html =
    '<div class="fb-reg-card"><div class="fb-reg-title"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> Pendaftaran Member</div><div class="fb-reg-status ' +
    statusClass +
    '"><span class="fb-reg-dot"></span>' +
    statusLabel +
    '</div>';

  if (isOpen && REG_STATUS.link) {
    html +=
      '<a href="' +
      REG_STATUS.link +
      '" target="_blank" rel="noopener" class="fb-reg-btn open"><svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Daftar Sekarang</a>';
  } else if (isOpen) {
    html +=
      '<button class="fb-reg-btn open">Daftar Sekarang</button>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function openRulesModal() {
  renderRulesModal();
  document.getElementById('rulesModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeRulesModal() {
  document.getElementById('rulesModal').classList.remove('active');
  document.body.style.overflow = '';
}
function toggleFaq(btn) {
  var item = btn.closest('.fb-faq-item');
  if (!item) return;
  document.querySelectorAll('.fb-faq-item.active').forEach(function (activeItem) {
    if (activeItem !== item) activeItem.classList.remove('active');
  });
  item.classList.toggle('active');
}

function updateFanbaseUI() {
  if (HISTORY_DATA.length === 0) {
    var historyContent = document.getElementById('historyPageContent');
    if (historyContent && !historyContent.querySelector('.history-empty')) {
      historyContent.innerHTML =
        '<div class="history-empty">Belum ada konten sejarah yang ditambahkan oleh Admin.</div>';
    }
  }
  if (RULES_DATA.length === 0) {
    var rulesContent = document.getElementById('rulesTableContent');
    if (rulesContent && !rulesContent.querySelector('.rules-empty')) {
      rulesContent.innerHTML =
        '<div class="rules-empty">Belum ada peraturan yang ditambahkan oleh Admin.</div>';
    }
  }
  if (FAQ_DATA.length === 0) {
    var faqContent = document.getElementById('fbFaqList');
    if (faqContent && !faqContent.querySelector('.rules-empty')) {
      faqContent.innerHTML =
        '<div class="rules-empty">Belum ada FAQ yang ditambahkan oleh Admin.</div>';
    }
  }
  renderRegStatus();
}

function renderArticles() {
  var grid = document.getElementById('artikelGrid');
  var comingSoon = document.getElementById('artikelComingSoon');
  var badge = document.getElementById('artikelTotalBadge');
  badge.textContent = ARTICLE_DATA.length;
  updateNavBadges();
  if (ARTICLE_DATA.length === 0) {
    comingSoon.style.display = '';
    grid.style.display = 'none';
    grid.innerHTML = '';
    return;
  }
  comingSoon.style.display = 'none';
  grid.style.display = '';
  grid.classList.add('has-articles');
  var html = '';
  ARTICLE_DATA.forEach(function (article, i) {
    var delay = Math.min(i * 80, 600);
    var hasThumb = article.thumbnail && article.thumbnail.trim();
    var safeId = i;
    html +=
      '<div class="artikel-card" style="transition-delay:' +
      delay +
      'ms" onclick="showArticleDetail(' +
      safeId +
      ')">';
    if (hasThumb) {
      html +=
        '<div class="artikel-card-thumb"><img src="' +
        article.thumbnail +
        '" alt="' +
        escapeHtml(article.title) +
        '" loading="lazy"><div class="artikel-card-thumb-overlay"></div></div>';
    } else {
      html +=
        '<div class="artikel-card-thumb artikel-card-thumb-placeholder"><div class="artikel-card-thumb-placeholder-inner"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>' +
        escapeHtml(article.category || 'Artikel') +
        '</span></div></div>';
    }
    html += '<div class="artikel-card-body"><div class="artikel-card-meta">';
    if (article.date) {
      html +=
        '<span class="artikel-card-date"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        escapeHtml(article.date) +
        '</span>';
    }
    if (article.author) {
      html +=
        '<span class="artikel-card-author"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        escapeHtml(article.author) +
        '</span>';
    }
    if (article.category) {
      html +=
        '<span class="artikel-card-category">' +
        escapeHtml(article.category) +
        '</span>';
    }
    html +=
      '</div><div class="artikel-card-title">' +
      escapeHtml(article.title) +
      '</div>';
    if (article.excerpt) {
      html +=
        '<div class="artikel-card-excerpt">' +
        escapeHtml(article.excerpt) +
        '</div>';
    }
    html +=
      '<div class="artikel-card-read">Baca selengkapnya <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div></div>';
  });
  grid.innerHTML = html;
  setTimeout(function () {
    grid.querySelectorAll('.artikel-card').forEach(function (card, idx) {
      setTimeout(function () {
        card.classList.add('visible');
      }, idx * 80);
    });
  }, 60);
}

function showArticleDetail(idx) {
  var article = ARTICLE_DATA[idx];
  if (!article) return;
  document.getElementById('artikelListView').classList.remove('active');
  var dv = document.getElementById('artikelDetailView');
  dv.classList.add('active');
  var hasThumb = article.thumbnail && article.thumbnail.trim();
  var noThumbClass = hasThumb ? '' : ' artikel-no-thumb';
  var html =
    '<div class="section-header"><button class="back-btn" onclick="closeArticleDetail()" aria-label="Kembali"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h2>Artikel</h2></div><div class="artikel-detail-hero' +
    noThumbClass +
    '">';
  if (hasThumb) {
    html +=
      '<div class="artikel-detail-thumb"><img src="' +
      article.thumbnail +
      '" alt="' +
      escapeHtml(article.title) +
      '" loading="lazy"><div class="artikel-detail-thumb-overlay"></div></div>';
  }
  html += '<div class="artikel-detail-hero-text">';
  if (article.category) {
    html +=
      '<span class="artikel-detail-category">' +
      escapeHtml(article.category) +
      '</span>';
  }
  html +=
    '<div class="artikel-detail-title">' +
    escapeHtml(article.title) +
    '</div><div class="artikel-detail-meta">';
  if (article.date) {
    html +=
      '<span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
      escapeHtml(article.date) +
      '</span>';
  }
  if (article.author) {
    html +=
      '<span><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;margin-right:4px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
      escapeHtml(article.author) +
      '</span>';
  }
  html += '</div></div></div>';
  var contentHTML = article.content;
  if (contentHTML) {
    if (!/<[a-z][\s\S]*>/i.test(contentHTML)) {
      contentHTML =
        '<p>' +
        contentHTML.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') +
        '</p>';
    }
  } else if (article.excerpt) {
    contentHTML = '<p>' + escapeHtml(article.excerpt) + '</p>';
  } else {
    contentHTML = '<p style="color:var(--text-muted)">Belum ada konten artikel.</p>';
  }
  html +=
    '<div class="artikel-detail-content">' +
    contentHTML +
    '</div><div class="artikel-detail-nav"><button class="btn-enter" onclick="closeArticleDetail()" style="padding:12px 32px;font-size:.88rem">Kembali ke Artikel</button></div>';
  dv.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeArticleDetail() {
  document.getElementById('artikelDetailView').classList.remove('active');
  document.getElementById('artikelDetailView').innerHTML = '';
  document.getElementById('artikelListView').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQuiz() {
  var comingSoon = document.getElementById('quizComingSoon');
  var content = document.getElementById('quizContent');
  var lbEl = document.getElementById('quizLeaderboard');
  var badge = document.getElementById('quizTotalBadge');
  badge.textContent = QUIZ_DATA.length;
  updateNavBadges();
  if (QUIZ_DATA.length === 0) {
    comingSoon.style.display = '';
    content.style.display = 'none';
    content.classList.remove('has-quiz');
    content.innerHTML = '';
    lbEl.style.display = 'none';
    return;
  }
  comingSoon.style.display = 'none';
  content.style.display = '';
  content.classList.add('has-quiz');
  lbEl.style.display = 'none';
  var html =
    '<div class="quiz-landing"><div class="quiz-landing-text">Siap menguji pengetahuanmu tentang Lana?</div><div class="quiz-landing-actions">';
  html +=
    '<button class="btn-enter quiz-start-btn" onclick="startQuizPlay()"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;margin-right:8px"><polygon points="5 3 19 12 5 21 5 3"/></svg>Mulai Quiz</button>';
  html +=
    '<button class="quiz-lb-btn" onclick="showLeaderboardPage()"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;margin-right:8px"><path d="M12 15l-2 5l2-1l2 1l-2-5z"/><path d="M6 4l1.5 3L6 10l3-1.5L12 10l-1.5-3L12 4L9 5.5L6 4z"/><path d="M18 4l1.5 3L18 10l3-1.5L24 10l-1.5-3L24 4l-3 1.5L18 4z"/></svg>🏆 Papan Peringkat</button>';
  html += '</div></div>';
  content.innerHTML = html;
}

function startQuizPlay() {
  quizScore = 0;
  quizAnswered = 0;
  currentQuizIdx = 0;
  quizSubmittedName = '';
  var content = document.getElementById('quizContent');
  content.innerHTML = '<div class="quiz-play-area" id="quizPlayArea"></div>';
  renderSingleQuestion();
}

function renderSingleQuestion() {
  var playArea = document.getElementById('quizPlayArea');
  if (!playArea) return;
  if (currentQuizIdx >= QUIZ_DATA.length) {
    showQuizScoreInPlay();
    return;
  }
  var q = QUIZ_DATA[currentQuizIdx];
  var options = [
    { letter: 'A', text: q.optionA },
    { letter: 'B', text: q.optionB },
    { letter: 'C', text: q.optionC },
    { letter: 'D', text: q.optionD }
  ];
  var html =
    '<div class="quiz-progress">Soal ' +
    (currentQuizIdx + 1) +
    ' dari ' +
    QUIZ_DATA.length +
    '</div><div class="quiz-item visible" id="quizItemCurrent"><div class="quiz-item-header"><div class="quiz-item-no">' +
    (currentQuizIdx + 1) +
    '</div><div class="quiz-question">' +
    escapeHtml(q.question) +
    '</div></div><div class="quiz-options">';
  options.forEach(function (opt) {
    if (opt.text && opt.text.trim()) {
      html +=
        '<div class="quiz-option" data-letter="' +
        opt.letter +
        '" onclick="answerQuiz(\'' +
        opt.letter +
        '\')"><div class="quiz-option-letter">' +
        opt.letter +
        '</div><div class="quiz-option-text">' +
        escapeHtml(opt.text) +
        '</div></div>';
    }
  });
  html +=
    '</div><div class="quiz-result" id="quizResultCurrent"></div></div>';
  playArea.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function answerQuiz(letter) {
  var item = document.getElementById('quizItemCurrent');
  if (!item || item.getAttribute('data-answered')) return;
  item.setAttribute('data-answered', 'true');
  quizAnswered++;
  var correctAnswer = QUIZ_DATA[currentQuizIdx].answer;
  var isCorrect = letter === correctAnswer;
  if (isCorrect) quizScore++;
  item.querySelectorAll('.quiz-option').forEach(function (opt) {
    var optLetter = opt.getAttribute('data-letter');
    opt.style.pointerEvents = 'none';
    if (optLetter === correctAnswer) opt.classList.add('correct');
    if (optLetter === letter && !isCorrect) opt.classList.add('wrong');
    if (optLetter === letter) opt.classList.add('selected');
  });
  var resultEl = document.getElementById('quizResultCurrent');
  if (isCorrect) {
    resultEl.className = 'quiz-result show correct';
    resultEl.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Benar! 🎉';
  } else {
    resultEl.innerHTML =
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Salah! Jawaban benar: <strong>' +
      correctAnswer +
      '</strong>';
    resultEl.className = 'quiz-result show wrong';
  }
  setTimeout(function () {
    currentQuizIdx++;
    renderSingleQuestion();
  }, 1500);
}

function showQuizScoreInPlay() {
  var playArea = document.getElementById('quizPlayArea');
  if (!playArea) return;
  var total = QUIZ_DATA.length;
  var percentage = Math.round((quizScore / total) * 100);
  var html =
    '<div class="quiz-score-card"><div class="quiz-score-label">Skor Kamu</div><div class="quiz-score-value">' +
    percentage +
    '%</div><div class="quiz-score-detail">' +
    quizScore +
    ' dari ' +
    total +
    ' soal dijawab benar</div><div style="margin-top:20px"><button class="btn-enter" onclick="openQuizNameModal()" style="padding:12px 32px;margin-top:0">Simpan Skor ✨</button></div><button class="quiz-restart-btn" onclick="startQuizPlay()" style="margin-top:12px"><svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Ulangi Quiz</button></div>';
  playArea.innerHTML = html;
  playArea.querySelector('.quiz-score-card').scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

function openQuizNameModal() {
  document.getElementById('quizNameModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeQuizNameModal() {
  document.getElementById('quizNameModal').classList.remove('active');
  document.body.style.overflow = '';
}

function submitQuizScoreFromModal() {
  var nameInput = document.getElementById('quizInputName');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    nameInput.focus();
    nameInput.style.borderColor = 'rgba(248,113,113,0.5)';
    nameInput.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.1)';
    setTimeout(function () {
      nameInput.style.borderColor = '';
      nameInput.style.boxShadow = '';
    }, 1500);
    return;
  }
  closeQuizNameModal();
  quizSubmittedName = name;
  var total = QUIZ_DATA.length;
  var percentage = Math.round((quizScore / total) * 100);

  fetch(API_URL, {
    method: 'POST',
    redirect: 'follow',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'submitQuizScore',
      nama: name,
      score: percentage,
      correct: quizScore,
      total: total
    })
  })
    .then(function () {
      showLeaderboardPage(name, percentage);
    })
    .catch(function () {
      alert('Gagal menyimpan skor. Coba lagi nanti.');
    });
}

function loadQuizLeaderboard() {
  return fetch(API_URL + '?action=readSkorKuis&t=' + Date.now())
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0) {
        window._quizLeaderboard = data.map(function (row) {
          return {
            nama: row.nama || row.name || '',
            score: parseInt(row.score || row.skor || 0, 10),
            correct: parseInt(row.correct || 0, 10),
            total: parseInt(row.total || 0, 10),
            timestamp: row.timestamp || row.tanggal || ''
          };
        });
      } else {
        window._quizLeaderboard = [];
      }
    })
    .catch(function () {
      window._quizLeaderboard = [];
    });
}

function showLeaderboardPage(myName, myScore) {
  var content = document.getElementById('quizContent');
  content.innerHTML =
    '<div class="section-header"><button class="back-btn" onclick="backToQuizLanding()"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h2>Papan Peringkat</h2></div><div style="text-align:center;padding:20px;color:var(--text-muted)">Memuat data...</div>';
  loadQuizLeaderboard().then(function () {
    var data = window._quizLeaderboard || [];
    data.sort(function (a, b) {
      return b.score - a.score;
    });
    var html =
      '<div class="section-header"><button class="back-btn" onclick="backToQuizLanding()"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h2>Papan Peringkat</h2></div>';
    if (data.length === 0) {
      html += '<div class="quiz-lb-empty">Belum ada peserta di papan peringkat.</div>';
    } else {
      html +=
        '<div class="quiz-lb-table-wrap"><div class="quiz-lb-table-header"><span>Peringkat</span><span>Nama</span><span>Skor</span></div>';
      data.slice(0, 20).forEach(function (entry, i) {
        var isMe =
          myName && entry.nama === myName && entry.score === myScore;
        var medal =
          i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        html +=
          '<div class="quiz-lb-row' +
          (isMe ? ' is-me' : '') +
          '"><div class="quiz-lb-rank">' +
          medal +
          (i + 1) +
          '</div><div class="quiz-lb-name">' +
          escapeHtml(entry.nama) +
          (isMe ? '<span class="quiz-lb-you-badge">Kamu</span>' : '') +
          '</div><div class="quiz-lb-score">' +
          entry.score +
          '%</div></div>';
      });
      html += '</div>';
    }
    content.innerHTML = html;
  });
}
function backToQuizLanding() {
  renderQuiz();
}

function renderProjects() {
  var grid = document.getElementById('projectGrid');
  var comingSoon = document.getElementById('projectComingSoon');
  var badge = document.getElementById('projectTotalBadge');
  badge.textContent = PROJECT_DATA.length;
  updateNavBadges();
  if (PROJECT_DATA.length === 0) {
    comingSoon.style.display = '';
    grid.style.display = 'none';
    grid.innerHTML = '';
    return;
  }
  comingSoon.style.display = 'none';
  grid.style.display = '';
  grid.classList.add('has-projects');
  var html = '';
  PROJECT_DATA.forEach(function (project, i) {
    var delay = Math.min(i * 80, 600);
    var hasThumb = project.thumbnail && project.thumbnail.trim();
    var statusClass = project.status || 'upcoming';
    var statusLabel =
      statusClass === 'ongoing'
        ? 'Ongoing'
        : statusClass === 'completed'
          ? 'Completed'
          : 'Upcoming';
    html +=
      '<div class="project-card" style="transition-delay:' +
      delay +
      'ms" onclick="showProjectDetail(' +
      i +
      ')">';
    if (hasThumb) {
      html +=
        '<div class="project-card-thumb"><img src="' +
        project.thumbnail +
        '" alt="' +
        escapeHtml(project.title) +
        '" loading="lazy"><div class="project-card-thumb-overlay"></div></div>';
    }
    html += '<div class="project-card-body"><div class="project-card-meta">';
    if (project.date) {
      html +=
        '<span class="project-card-date"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        escapeHtml(project.date) +
        '</span>';
    }
    html += '</div><div class="project-card-title">' +
      escapeHtml(project.title) +
      '</div>';

    if (project.excerpt) {
      html +=
        '<div class="project-card-excerpt">' +
        escapeHtml(project.excerpt) +
        '</div>';
    }
    html +=
      '<div class="project-card-read">Lihat detail <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div></div>';
  });
  grid.innerHTML = html;
  setTimeout(function () {
    grid.querySelectorAll('.project-card').forEach(function (card, idx) {
      setTimeout(function () {
        card.classList.add('visible');
      }, idx * 80);
    });
  }, 60);
}

function showProjectDetail(idx) {
  var project = PROJECT_DATA[idx];
  if (!project) return;
  document.getElementById('projectListView').classList.remove('active');
  var dv = document.getElementById('projectDetailView');
  dv.classList.add('active');
  var hasThumb = project.thumbnail && project.thumbnail.trim();
  var noThumbClass = hasThumb ? '' : ' project-no-thumb';
  var statusClass = project.status || 'upcoming';
  var statusLabel =
    statusClass === 'ongoing'
      ? 'Ongoing'
      : statusClass === 'completed'
        ? 'Completed'
        : 'Upcoming';
  var html =
    '<div class="section-header"><button class="back-btn" onclick="closeProjectDetail()" aria-label="Kembali"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h2>Project Fanbase</h2></div><div class="project-detail-hero' +
    noThumbClass +
    '">';
  if (hasThumb) {
    html +=
      '<div class="project-detail-thumb"><img src="' +
      project.thumbnail +
      '" alt="' +
      escapeHtml(project.title) +
      '" loading="lazy"><div class="project-detail-thumb-overlay"></div></div>';
  }
  html += '<div class="project-detail-hero-text"><span class="project-detail-category"></span><div class="project-detail-title">' +
    escapeHtml(project.title) +
    '</div><div class="project-detail-meta">';
  if (project.date) {
    html +=
      '<span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
      escapeHtml(project.date) +
      '</span>';
  }
  html += '</div></div></div>';
  var contentHTML = project.content;
  if (contentHTML) {
    if (!/<[a-z][\s\S]*>/i.test(contentHTML)) {
      contentHTML =
        '<p>' +
        contentHTML.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') +
        '</p>';
    }
  } else if (project.excerpt) {
    contentHTML = '<p>' + escapeHtml(project.excerpt) + '</p>';
  } else {
    contentHTML = '<p style="color:var(--text-muted)">Belum ada detail project.</p>';
  }
  html += '<div class="project-detail-content">' + contentHTML + '</div>';
  if (project.photos && project.photos.trim()) {
    var photoUrls = project.photos
      .split(',')
      .map(function (u) {
        return u.trim();
      })
      .filter(function (u) {
        return u.length > 0;
      });
    if (photoUrls.length > 0) {
      window._projectPhotos = photoUrls.map(function (u) {
        return { src: u, alt: 'Dokumentasi' };
      });
      html +=
        '<div class="project-detail-gallery"><div class="project-detail-gallery-title"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--accent-light);fill:none;stroke-width:2;margin-right:8px"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Dokumentasi</div><div class="gal-masonry">';
      photoUrls.forEach(function (url, i) {
        html +=
          '<div class="gal-item" onclick="openProjectPhoto(' +
          i +
          ')"><div class="gal-item-img-wrap"><img src="' +
          url +
          '" alt="Dokumentasi" loading="lazy"></div><div class="gal-item-overlay"><div class="gal-item-zoom"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div></div></div>';
      });
      html += '</div></div>';
    }
  } else {
    window._projectPhotos = [];
  }
  html +=
    '<div class="project-detail-nav"><button class="btn-enter" onclick="closeProjectDetail()" style="padding:12px 32px;font-size:.88rem">Kembali ke Project</button></div>';
  dv.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openProjectPhoto(idx) {
  lbImages = window._projectPhotos || [];
  if (lbImages.length > 0) openLightbox(idx);
}
function closeProjectDetail() {
  document.getElementById('projectDetailView').classList.remove('active');
  document.getElementById('projectDetailView').innerHTML = '';
  document.getElementById('projectListView').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

var currentRootFolder = 'lana';
var currentSubTab = null;
var lbImages = [];
var lbIndex = 0;

function switchRootFolder(folder) {
  currentRootFolder = folder;
  currentSubTab = null;
  document.querySelectorAll('.gal-root-tab').forEach(function (t) {
    t.classList.toggle('active', t.getAttribute('data-folder') === folder);
  });
  updateGalTabs();
  renderGalFolders();
}
function updateGalTabs() {
  var fd = galleryData[currentRootFolder];
  if (!fd) return;
  var total = 0;
  fd.tabKeys.forEach(function (k) {
    total += fd.images[k].length;
  });
  document.querySelectorAll('.gal-root-tab').forEach(function (t) {
    if (t.getAttribute('data-folder') === currentRootFolder)
      t.querySelector('.gal-root-tab-count').textContent = total;
  });
}

function renderGalFolders() {
  var fd = galleryData[currentRootFolder];
  if (!fd) return;
  var el = document.getElementById('galContent');
  var html = '<div class="gal-folders-grid">';
  fd.tabKeys.forEach(function (key) {
    var imgs = fd.images[key];
    var label = fd.tabLabels[key] || key;
    var cover = imgs.length > 0 ? imgs[imgs.length - 1].src : '';
    html +=
      '<div class="gal-folder-card" onclick="openGalSubTab(\'' +
      key +
      '\')"><div class="gal-folder-cover">' +
      (cover
        ? '<img src="' +
        cover +
        '" alt="' +
        label +
        '" loading="lazy">'
        : '<div style="width:100%;height:100%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:.8rem">Kosong</div>') +
      '<div class="gal-folder-cover-overlay"></div>' +
      (imgs.length > 0
        ? '<div class="gal-folder-badge"><span class="gal-folder-badge-dot"></span>' +
        imgs.length +
        ' foto</div>'
        : '') +
      '</div><div class="gal-folder-info"><div class="gal-folder-icon"><svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div><div class="gal-folder-text"><div class="gal-folder-name">' +
      label +
      '</div><div class="gal-folder-count"><span>' +
      imgs.length +
      '</span> foto</div></div><svg class="gal-folder-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
  setTimeout(function () {
    el.querySelectorAll('.gal-folder-card').forEach(function (c, i) {
      setTimeout(function () {
        c.classList.add('visible');
      }, i * 100);
    });
  }, 50);
}

function openGalSubTab(key) {
  currentSubTab = key;
  var fd = galleryData[currentRootFolder];
  var originalImgs = fd.images[key];
  var imgs = originalImgs.slice().reverse();
  var label = fd.tabLabels[key] || key;
  var el = document.getElementById('galContent');
  var html =
    '<div class="gal-photos-header"><button class="back-btn" onclick="renderGalFolders()" aria-label="Kembali"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button><h3>' +
    label +
    '</h3><span class="gal-photos-count">' +
    imgs.length +
    ' foto</span></div>';
  if (imgs.length === 0) {
    html +=
      '<div class="gal-masonry"><div class="gal-empty">Belum ada foto di album ini.</div></div>';
  } else {
    html += '<div class="gal-masonry">';
    imgs.forEach(function (img, i) {
      html +=
        '<div class="gal-item" onclick="openLightbox(' +
        i +
        ')"><div class="gal-item-img-wrap"><img src="' +
        img.src +
        '" alt="' +
        img.alt +
        '" loading="lazy"></div><div class="gal-item-overlay"><div class="gal-item-zoom"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div></div></div>';
    });
    html += '</div>';
  }
  el.innerHTML = html;
  lbImages = imgs;
  setTimeout(function () {
    el.querySelectorAll('.gal-item').forEach(function (it, i) {
      setTimeout(function () {
        it.classList.add('visible');
      }, i * 60);
    });
  }, 50);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openLightbox(idx) {
  lbIndex = idx;
  updateLightbox();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
function lightboxNav(dir) {
  lbIndex += dir;
  if (lbIndex < 0) lbIndex = lbImages.length - 1;
  if (lbIndex >= lbImages.length) lbIndex = 0;
  updateLightbox();
}
function updateLightbox() {
  var img = document.getElementById('lightboxImg');
  img.style.opacity = '0';
  setTimeout(function () {
    img.src = lbImages[lbIndex].src;
    img.alt = lbImages[lbIndex].alt;
    img.style.opacity = '1';
  }, 150);
  document.getElementById('lbCounter').textContent =
    lbIndex + 1 + ' / ' + lbImages.length;
  document.getElementById('lbPrev').classList.toggle('disabled', lbImages.length <= 1);
  document.getElementById('lbNext').classList.toggle('disabled', lbImages.length <= 1);
}

document.addEventListener('keydown', function (e) {
  var lb = document.getElementById('lightbox');
  if (!lb.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
});

function updateNavBadges() {
  var sections = [
    { key: 'artikel', data: ARTICLE_DATA },
    { key: 'quiz', data: QUIZ_DATA },
    { key: 'project', data: PROJECT_DATA }
  ];
  sections.forEach(function (s) {
    var topLinks = document.querySelectorAll(
      '.topnav-link[data-section="' + s.key + '"]'
    );
    topLinks.forEach(function (link) {
      var badge = link.querySelector('.nav-badge-soon');
      if (badge && s.data.length > 0) badge.style.display = 'none';
    });
    var mobLinks = document.querySelectorAll(
      '.mobile-menu-link[data-section="' + s.key + '"]'
    );
    mobLinks.forEach(function (link) {
      var badge = link.querySelector('.nav-badge-soon');
      if (badge && s.data.length > 0) badge.style.display = 'none';
    });
  });
}

function enterSite() {
  var hero = document.getElementById('heroSection');
  var main = document.getElementById('mainContent');
  var nav = document.getElementById('topnav');
  hero.style.opacity = '0';
  hero.style.transition = 'opacity .5s';
  setTimeout(function () {
    hero.style.display = 'none';
    main.style.display = 'block';
    nav.classList.add('visible');
    document.body.classList.add('scrolled');
    window.scrollTo(0, 0);
    loadSchedules().then(function () {
      renderSchedule();
      renderReschedule();
      renderUnitSongs();
    });
    loadHashtags().then(function () {
      renderHashtags();
    });
    loadVideos().then(function () {
      renderVideoPreview();
    });
    loadGallery().then(function () {
      updateGalTabs();
      renderGalFolders();
    });
    loadHistory();
    loadRules();
    loadFAQ().then(function () {
      renderFAQ();
    });
    loadRegStatus().then(function () {
      renderRegStatus();
    });
    loadArticles().then(function () {
      renderArticles();
    });
    loadQuiz().then(function () {
      renderQuiz();
    });
    loadProjects().then(function () {
      renderProjects();
    });
    document.querySelectorAll('.section').forEach(function (s) {
      s.classList.remove('active');
    });
    document.getElementById('profile').classList.add('active');
    document.querySelectorAll('.topnav-link[data-section]').forEach(function (l) {
      l.classList.toggle('current', l.getAttribute('data-section') === 'profile');
    });
    updateMobileMenuCurrent('profile');
    setTimeout(function () {
      updateFanbaseUI();
    }, 1500);
  }, 500);
}

function backToHero() {
  closeMobileMenu();
  var hero = document.getElementById('heroSection');
  var main = document.getElementById('mainContent');
  var nav = document.getElementById('topnav');
  main.style.display = 'none';
  nav.classList.remove('visible');
  document.body.classList.remove('scrolled');
  hero.style.display = 'flex';
  hero.style.opacity = '1';
  window.scrollTo(0, 0);
}

function showSection(id) {
  if (id !== 'reschedule') closeRescheduleAllViews();
  else {
    closeRescheduleAllViews();
    renderReschedule();
  }
  if (id !== 'artikel') closeArticleDetail();
  if (id !== 'project') closeProjectDetail();
  if (id !== 'birthday' && countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  document.querySelectorAll('.section').forEach(function (s) {
    s.classList.remove('active');
  });
  var target = document.getElementById(id);
  if (target) target.classList.add('active');
  document.querySelectorAll('.topnav-link[data-section]').forEach(function (l) {
    l.classList.toggle('current', l.getAttribute('data-section') === id);
  });
  updateMobileMenuCurrent(
    id === 'birthday'
      ? 'profile'
      : id === 'history'
        ? 'fanbase'
        : id
  );
  if (id === 'gallery')
    loadGallery().then(function () {
      updateGalTabs();
      renderGalFolders();
    });
  if (id === 'hashtags')
    loadHashtags().then(function () {
      renderHashtagPage();
    });
  if (id === 'videos') renderVideoPage();
  if (id === 'reschedule') renderReschedule();
  if (id === 'history')
    loadHistory().then(function () {
      renderHistoryPage();
    });
  if (id === 'birthday') {
    startCountdown();
    loadWishes().then(function () {
      renderBdayCards();
    });
  }
  if (id === 'artikel')
    loadArticles().then(function () {
      renderArticles();
    });
  if (id === 'quiz')
    loadQuiz().then(function () {
      renderQuiz();
    });
  if (id === 'project')
    loadProjects().then(function () {
      renderProjects();
    });
  if (id === 'fanbase') updateFanbaseUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

(function () {
  var c = document.getElementById('particles');
  if (!c) return;
  for (var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-10px';
    p.style.animationDuration = 6 + Math.random() * 8 + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = p.style.height = 1 + Math.random() * 2 + 'px';
    c.appendChild(p);
  }
})();
window.addEventListener('scroll', function () {
  var btn = document.getElementById('backToTop');
  var nav = document.getElementById('topnav');
  var y = window.scrollY || window.pageYOffset;
  btn.classList.toggle('visible', y > 400);
  nav.classList.toggle('scrolled', y > 10);
});

(function () {
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbContent = document.querySelector('.lightbox-content');
  if (!lb || !lbImg || !lbContent) return;
  var zoomBtn = document.createElement('button');
  zoomBtn.className = 'lb-zoom-btn';
  zoomBtn.setAttribute('aria-label', 'Zoom');
  zoomBtn.innerHTML =
    '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
  lbContent.appendChild(zoomBtn);
  var isZoomed = false;
  var zoomScale = 2.5;
  var panX = 0,
    panY = 0;
  var isDragging = false;
  var dragStartX = 0,
    dragStartY = 0;
  var panStartX = 0,
    panStartY = 0;
  function resetZoom() {
    isZoomed = false;
    panX = 0;
    panY = 0;
    lbImg.classList.remove('lb-zoomed', 'lb-dragging');
    lbImg.style.transform = '';
    updateZoomIcon();
  }
  function applyZoom() {
    lbImg.style.transform =
      'scale(' + zoomScale + ') translate(' + panX + 'px, ' + panY + 'px)';
  }
  function toggleZoom() {
    if (isZoomed) {
      resetZoom();
    } else {
      isZoomed = true;
      lbImg.classList.add('lb-zoomed');
      panX = 0;
      panY = 0;
      applyZoom();
      updateZoomIcon();
    }
  }
  function updateZoomIcon() {
    if (isZoomed) {
      zoomBtn.innerHTML =
        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    } else {
      zoomBtn.innerHTML =
        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    }
  }
  zoomBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleZoom();
  });
  lbImg.addEventListener('dblclick', function (e) {
    e.preventDefault();
    e.stopPropagation();
    toggleZoom();
  });
  var lastTapTime = 0;
  var lbImgTouchStartX = 0,
    lbImgTouchStartY = 0,
    lbImgTouchMoved = false;
  lbImg.addEventListener(
    'touchstart',
    function (e) {
      lbImgTouchStartX = e.touches[0].clientX;
      lbImgTouchStartY = e.touches[0].clientY;
      lbImgTouchMoved = false;
    },
    { passive: true }
  );
  lbImg.addEventListener(
    'touchmove',
    function () {
      lbImgTouchMoved = true;
    },
    { passive: true }
  );
  lbImg.addEventListener('touchend', function (e) {
    if (lbImgTouchMoved) return;
    var now = Date.now();
    if (now - lastTapTime < 300) {
      e.preventDefault();
      toggleZoom();
    }
    lastTapTime = now;
  });
  lbContent.addEventListener(
    'wheel',
    function (e) {
      if (!lb.classList.contains('active')) return;
      e.preventDefault();
      if (e.deltaY < 0 && !isZoomed) {
        isZoomed = true;
        lbImg.classList.add('lb-zoomed');
        panX = 0;
        panY = 0;
        applyZoom();
        updateZoomIcon();
      } else if (e.deltaY > 0 && isZoomed) {
        resetZoom();
      }
    },
    { passive: false }
  );
  lbImg.addEventListener('mousedown', function (e) {
    if (!isZoomed) return;
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = panX;
    panStartY = panY;
    lbImg.classList.add('lb-dragging');
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging || !isZoomed) return;
    panX = panStartX + (e.clientX - dragStartX) / zoomScale;
    panY = panStartY + (e.clientY - dragStartY) / zoomScale;
    applyZoom();
  });
  document.addEventListener('mouseup', function () {
    if (isDragging) {
      isDragging = false;
      lbImg.classList.remove('lb-dragging');
    }
  });
  var touchStartX = 0,
    touchStartY = 0;
  var touchMoved = false;
  var swipeThreshold = 50;
  lbContent.addEventListener(
    'touchstart',
    function (e) {
      if (!lb.classList.contains('active')) return;
      if (isZoomed && e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        panStartX = panX;
        panStartY = panY;
        lbImg.classList.add('lb-dragging');
        return;
      }
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    },
    { passive: false }
  );
  lbContent.addEventListener(
    'touchmove',
    function (e) {
      if (!lb.classList.contains('active')) return;
      if (isZoomed && isDragging && e.touches.length === 1) {
        panX = panStartX + (e.touches[0].clientX - dragStartX) / zoomScale;
        panY = panStartY + (e.touches[0].clientY - dragStartY) / zoomScale;
        applyZoom();
        e.preventDefault();
        return;
      }
      touchMoved = true;
    },
    { passive: false }
  );
  lbContent.addEventListener('touchend', function (e) {
    if (!lb.classList.contains('active')) return;
    if (isZoomed) {
      isDragging = false;
      lbImg.classList.remove('lb-dragging');
      return;
    }
    if (!touchMoved) return;
    var diffX = touchStartX - e.changedTouches[0].clientX;
    var diffY = touchStartY - e.changedTouches[0].clientY;
    if (
      Math.abs(diffX) > swipeThreshold &&
      Math.abs(diffX) > Math.abs(diffY) * 1.5
    ) {
      lightboxNav(diffX > 0 ? 1 : -1);
    }
  });
  var lbObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (
        m.attributeName === 'class' &&
        !lb.classList.contains('active')
      ) {
        resetZoom();
      }
    });
  });
  lbObserver.observe(lb, { attributes: true });
  var imgObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'src') resetZoom();
    });
  });
  imgObserver.observe(lbImg, { attributes: true });
  var _origRenderGalFolders = renderGalFolders;
  renderGalFolders = function () {
    var fd = galleryData[currentRootFolder];
    if (fd && !fd._sortedNewest) {
      fd.tabKeys = fd.tabKeys.slice().reverse();
      fd._sortedNewest = true;
    }
    _origRenderGalFolders();
  };
})();

(function () {
  var style = document.createElement('style');
  style.innerHTML =
    '.project-card-thumb { aspect-ratio: auto !important; min-height: 200px; }' +
    '.project-card-thumb img { object-fit: contain !important; width: 100% !important; height: 100% !important; }' +
    '.project-card-thumb-placeholder { aspect-ratio: auto !important; min-height: 200px; }';
  document.head.appendChild(style);
})();

function openYtPopup(videoId) {
  var existing = document.getElementById('ytPopupOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'ytPopupOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;';

  var popup = document.createElement('div');
  popup.style.cssText = 'position:relative;width:90%;max-width:800px;padding-top:50%;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.5)';

  var iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = 'position:absolute;top:-40px;right:0;background:none;border:none;color:white;font-size:32px;cursor:pointer;';
  closeBtn.onclick = function () { overlay.remove(); };

  popup.appendChild(iframe);
  popup.appendChild(closeBtn);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.onclick = function (e) {
    if (e.target === overlay) overlay.remove();
  };
};

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function setTheme(theme, animate) {
  if (animate) {
    document.documentElement.classList.add('theme-anim');
    setTimeout(function() {
      document.documentElement.classList.remove('theme-anim');
    }, 400);
  }
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('lanautica-theme', theme);
  updateThemeUI(theme);
}

function toggleTheme() {
  var current = getCurrentTheme();
  var next = current === 'light' ? 'dark' : 'light';
  setTheme(next, true);
}

function updateThemeUI(theme) {
  var mobileThemeText = document.getElementById('mobileThemeText');
  var mobileThemeStatus = document.getElementById('mobileThemeStatus');
  var mobileThemeItem = document.getElementById('mobileThemeItem');
  if (mobileThemeText) {
    mobileThemeText.textContent = theme === 'light' ? 'Tema Terang' : 'Tema Gelap';
  }
  if (mobileThemeStatus) {
    mobileThemeStatus.textContent = 'Aktif';
    mobileThemeStatus.className = 'mobile-menu-theme-status ' + (theme === 'light' ? 'light' : 'dark');
  }
  if (mobileThemeItem) {
    var darkIcon = mobileThemeItem.querySelector('.mobile-theme-icon-dark');
    var lightIcon = mobileThemeItem.querySelector('.mobile-theme-icon-light');
    if (darkIcon && lightIcon) {
      darkIcon.style.display = theme === 'dark' ? '' : 'none';
      lightIcon.style.display = theme === 'light' ? '' : 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var theme = getCurrentTheme();
  updateThemeUI(theme);
  if (window.matchMedia) {
    var mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', function(e) {
        if (!localStorage.getItem('lanautica-theme')) {
          setTheme(e.matches ? 'light' : 'dark', true);
        }
      });
    }
  }
});