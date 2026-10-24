const menuButton = document.querySelector('#nav-toggle');
const menu = document.querySelector('#nav-menu');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    menu.classList.toggle('is-open', !isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      menu.classList.remove('is-open');
    });
  });
}

const year = document.querySelector('#year');
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const leetcodePanel = document.querySelector('.leetcode-panel');
const leetcodeRefreshButton = document.querySelector('#leetcode-refresh');

if (leetcodePanel && leetcodeRefreshButton) {
  const username = 'pratyushpratapsingh11';
  const apiUrl = `https://leetcode-api-pied.vercel.app/user/${username}`;
  const submissionsUrl = `${apiUrl}/submissions`;
  const difficultyElements = {
    Easy: document.querySelector('#leetcode-easy'),
    Medium: document.querySelector('#leetcode-medium'),
    Hard: document.querySelector('#leetcode-hard'),
  };
  const totalElement = document.querySelector('#leetcode-total');
  const submissionsElement = document.querySelector('#leetcode-submissions');
  const statusElement = document.querySelector('#leetcode-status');
  const updatedElement = document.querySelector('#leetcode-updated');
  const recentListElement = document.querySelector('#leetcode-recent-list');
  const numberFormat = new Intl.NumberFormat();
  let loading = false;

  const fetchJson = async (url, signal) => {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!response.ok) {
      throw new Error(`Stats service returned HTTP ${response.status}.`);
    }
    return response.json();
  };

  const refreshLeetCodeStats = async () => {
    if (loading) return;

    loading = true;
    leetcodeRefreshButton.disabled = true;
    leetcodeRefreshButton.textContent = 'Refreshing…';
    statusElement.textContent = 'Loading live stats…';
    leetcodePanel.dataset.state = 'loading';
    leetcodePanel.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    recentListElement.setAttribute('aria-busy', 'true');
    const [statsResult, submissionsResult] = await Promise.allSettled([
      fetchJson(apiUrl, controller.signal),
      fetchJson(submissionsUrl, controller.signal),
    ]);

    try {
      if (statsResult.status === 'fulfilled') {
        const data = statsResult.value;
        const accepted = data.submitStats?.acSubmissionNum;
        const allSolved = accepted?.find((entry) => entry.difficulty === 'All');
        const allSubmissions = data.submitStats?.totalSubmissionNum?.find(
          (entry) => entry.difficulty === 'All',
        );
        const counts = Object.fromEntries(
          Object.keys(difficultyElements).map((difficulty) => {
            const count = accepted?.find((entry) => entry.difficulty === difficulty)?.count;
            return [difficulty, count];
          }),
        );
        const validCount = (count) => Number.isInteger(count) && count >= 0;

        if (
          !validCount(allSolved?.count)
          || !validCount(allSolved?.submissions)
          || !validCount(allSubmissions?.submissions)
          || Object.values(counts).some((count) => !validCount(count))
        ) {
          throw new Error('Stats service returned an unexpected response.');
        }

        totalElement.textContent = numberFormat.format(allSolved.count);
        submissionsElement.textContent = `Accepted submissions: ${numberFormat.format(allSolved.submissions)}`;
        for (const [difficulty, element] of Object.entries(difficultyElements)) {
          element.textContent = numberFormat.format(counts[difficulty]);
        }

        updatedElement.textContent = `Updated ${new Intl.DateTimeFormat(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date())}`;
        statusElement.textContent = 'Live stats from LeetCode';
        leetcodePanel.dataset.state = 'live';
      } else {
        throw statsResult.reason;
      }
    } catch (error) {
      console.error('Unable to load LeetCode stats.', error);
      statusElement.textContent = 'Live stats unavailable. Try again or visit the profile.';
      leetcodePanel.dataset.state = 'error';
    }

    try {
      if (submissionsResult.status === 'rejected') {
        throw submissionsResult.reason;
      }

      const submissions = submissionsResult.value;
      if (!Array.isArray(submissions)) {
        throw new Error('Recent submissions service returned an unexpected response.');
      }

      const recentSubmissions = submissions
        .filter((submission) => (
          typeof submission.title === 'string'
          && submission.title.trim().length > 0
          && typeof submission.titleSlug === 'string'
          && /^[a-z0-9-]+$/.test(submission.titleSlug)
          && Number.isSafeInteger(Number(submission.timestamp))
          && Number(submission.timestamp) > 0
          && typeof submission.statusDisplay === 'string'
          && submission.statusDisplay.trim().length > 0
        ))
        .sort((first, second) => Number(second.timestamp) - Number(first.timestamp))
        .slice(0, 1);

      if (recentSubmissions.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'leetcode-recent-item leetcode-recent-empty';
        emptyItem.textContent = 'No recent submissions found.';
        recentListElement.replaceChildren(emptyItem);
        return;
      }

      const recentItems = recentSubmissions.map((submission) => {
        const item = document.createElement('li');
        item.className = 'leetcode-recent-item';

        const details = document.createElement('div');
        details.className = 'leetcode-recent-details';

        const problemLink = document.createElement('a');
        problemLink.className = 'leetcode-latest-problem';
        problemLink.href = `https://leetcode.com/problems/${submission.titleSlug}/`;
        problemLink.target = '_blank';
        problemLink.rel = 'noopener noreferrer';
        problemLink.textContent = submission.title;

        const attemptedAt = document.createElement('p');
        attemptedAt.className = 'leetcode-latest-date';
        attemptedAt.textContent = new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(Number(submission.timestamp) * 1000));

        const result = document.createElement('span');
        result.className = 'leetcode-submission-status';
        result.textContent = submission.statusDisplay;
        if (submission.statusDisplay === 'Accepted') {
          result.dataset.status = 'accepted';
        } else {
          result.dataset.status = 'attempt';
        }

        details.append(problemLink, attemptedAt);
        item.append(details, result);
        return item;
      });
      recentListElement.replaceChildren(...recentItems);
    } catch (error) {
      console.error('Unable to load recent LeetCode submissions.', error);
      const errorItem = document.createElement('li');
      errorItem.className = 'leetcode-recent-item leetcode-recent-empty';
      errorItem.textContent = 'Recent submissions unavailable. Visit your LeetCode profile to see activity.';
      recentListElement.replaceChildren(errorItem);
    } finally {
      window.clearTimeout(timeout);
      loading = false;
      leetcodePanel.setAttribute('aria-busy', 'false');
      recentListElement.setAttribute('aria-busy', 'false');
      leetcodeRefreshButton.disabled = false;
      leetcodeRefreshButton.textContent = 'Refresh stats';
    }
  };

  leetcodeRefreshButton.addEventListener('click', refreshLeetCodeStats);
  refreshLeetCodeStats();
  window.setInterval(refreshLeetCodeStats, 5 * 60 * 1000);
}

const gravityPortrait = document.querySelector('.gravity-portrait');
if (gravityPortrait) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = gravityPortrait.querySelector('img');
  const canvas = gravityPortrait.querySelector('canvas');
  const context = canvas.getContext('2d');
  let scrollFrame = 0;

  const initializeParticles = () => {
    const size = Math.round(gravityPortrait.clientWidth);
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const sampleCanvas = document.createElement('canvas');
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    const sampleSize = Math.round(size * scale);
    const sampleStep = Math.max(2, Math.round(scale * 1.5));
    const particles = [];

    sampleCanvas.width = sampleSize;
    sampleCanvas.height = sampleSize;
    sampleContext.drawImage(portrait, 0, 0, sampleSize, sampleSize);
    const imageData = sampleContext.getImageData(0, 0, sampleSize, sampleSize).data;
    canvas.width = sampleSize * 9;
    canvas.height = sampleSize;

    for (let y = 0; y < sampleSize; y += sampleStep) {
      for (let x = 0; x < sampleSize; x += sampleStep) {
        const offset = (y * sampleSize + x) * 4;
        const alpha = imageData[offset + 3];
        if (alpha < 100) continue;

        const seed = (x * 73856093) ^ (y * 19349663);
        const random = (value) => {
          const noise = Math.sin(seed + value * 78.233) * 43758.5453;
          return noise - Math.floor(noise);
        };
        particles.push({
          x: x / scale + size,
          y: y / scale,
          red: imageData[offset],
          green: imageData[offset + 1],
          blue: imageData[offset + 2],
          alpha: alpha / 255,
          drift: 35 + random(1) * 195,
          lift: (random(2) - 0.35) * 260,
          gust: 0.65 + random(4) * 1.1,
          size: sampleStep / scale,
        });
      }
    }

    const updateGravityPortrait = () => {
      const progress = reducedMotion.matches ? 0 : Math.min(window.scrollY / 620, 1);
      const scatter = progress ** 0.9;

      portrait.style.visibility = 'visible';
      portrait.style.opacity = String(0.2 * (1 - progress));
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        const wind = scatter * particle.gust * 3;
        const particleOpacity = Math.min(progress * 2.4, 1) * 0.55 * (1 - progress);
        context.fillStyle = `rgba(${particle.red}, ${particle.green}, ${particle.blue}, ${particle.alpha * particleOpacity})`;
        context.fillRect(
          (particle.x + particle.drift * wind) * scale,
          (particle.y + particle.lift * scatter) * scale,
          particle.size * scale * (1 + progress * 0.3),
          particle.size * scale * (1 + progress * 0.3),
        );
      }
      scrollFrame = 0;
    };

    updateGravityPortrait();

    window.addEventListener('scroll', () => {
      if (!scrollFrame) {
        scrollFrame = window.requestAnimationFrame(updateGravityPortrait);
      }
    }, { passive: true });

  };

  if (portrait.complete) {
    initializeParticles();
  } else {
    portrait.addEventListener('load', initializeParticles, { once: true });
  }
}
