
/**
 * Family Bible Reading — Logos deep-link patch (Dad only)
 * ------------------------------------------------------
 * Usage:
 *  1) Upload this file (logos-patch.js) to your site root (same folder as index.html).
 *  2) In index.html, add just before </body>:
 *       <script src="logos-patch.js"></script>
 *  3) Reload the page. If your active user is "Dad", adult links will open in Logos (ESV).
 */

(function(){
  const LOGOS_BOOK = {
    'Genesis':'Ge','Exodus':'Ex','Leviticus':'Le','Numbers':'Nu','Deuteronomy':'Dt',
    'Joshua':'Jos','Judges':'Jdg','Ruth':'Ru','1 Samuel':'1Sa','2 Samuel':'2Sa',
    '1 Kings':'1Ki','2 Kings':'2Ki','1 Chronicles':'1Ch','2 Chronicles':'2Ch','Ezra':'Ezr',
    'Nehemiah':'Ne','Esther':'Est','Job':'Job','Psalms':'Ps','Proverbs':'Pr','Ecclesiastes':'Ec',
    'Song of Solomon':'So','Isaiah':'Is','Jeremiah':'Je','Lamentations':'La','Ezekiel':'Eze','Daniel':'Da',
    'Hosea':'Ho','Joel':'Joe','Amos':'Am','Obadiah':'Ob','Jonah':'Jon','Micah':'Mic','Nahum':'Na',
    'Habakkuk':'Hab','Zephaniah':'Zep','Haggai':'Hag','Zechariah':'Zec','Malachi':'Mal',
    'Matthew':'Mt','Mark':'Mr','Luke':'Lu','John':'Joh','Acts':'Ac','Romans':'Ro',
    '1 Corinthians':'1Co','2 Corinthians':'2Co','Galatians':'Ga','Ephesians':'Eph','Philippians':'Php',
    'Colossians':'Col','1 Thessalonians':'1Th','2 Thessalonians':'2Th','1 Timothy':'1Ti','2 Timothy':'2Ti',
    'Titus':'Tit','Philemon':'Phm','Hebrews':'Heb','James':'Jas','1 Peter':'1Pe','2 Peter':'2Pe',
    '1 John':'1Jo','2 John':'2Jo','3 John':'3Jo','Jude':'Jud','Revelation':'Re'
  };
  function logosHref(book,start,end){
    const code = LOGOS_BOOK[book];
    if(!code) return null;
    if(!end || end===start){
      return `logosres:esv;ref=BibleESV.${code}${start}.1`;
    }
    return `logosres:esv;ref=BibleESV.${code}${start}.1-BibleESV.${code}${end}.999`;
  }

  function toRefText(node){
    // tries to extract a "Book X-Y" text near the link. Used as fallback if dataset not present.
    if(!node) return null;
    const parent = node.closest('.adult-card') || node.parentElement;
    if(!parent) return null;
    const txt = parent.textContent || '';
    // naive detection of "BookName Chapter" pattern; improves success on typical layout
    return txt;
  }

  function upgradeLinks(){
    try{
      const state = JSON.parse(localStorage.getItem('fbr-full2-otnt-stories')||localStorage.getItem('fbr-full-otnt-stories-v1')||'{}');
      const profs = state.profiles || [];
      const activeId = state.activeId || (profs[0] && profs[0].id);
      const active = (profs || []).find(p => p && p.id===activeId) || {id: activeId, type: 'adult'};
      if(active.id!=='dad') return; // Only switch for Dad

      // Adult "Read now (ESV)" or similar links inside .adult-card
      const cardLinks = Array.from(document.querySelectorAll('.adult-card a.underline'));
      cardLinks.forEach(a=>{
        // Avoid touching kids links or already converted ones
        if(!a.textContent) return;
        const txt = a.textContent.toLowerCase();
        if(txt.indexOf('read now')===-1 && txt.indexOf('esv')===-1) return;

        // Find a sibling element that has the reference text (e.g., "Genesis 1-3")
        const container = a.closest('.adult-card');
        const titleEl = container && Array.from(container.querySelectorAll('div')).find(el=>/^[A-Za-z].*\s\d/.test(el.textContent||''));
        const refText = (titleEl && titleEl.textContent) || toRefText(a) || '';
        const match = refText.match(/(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+(\d+)(?:-(\d+))?/);
        if(!match) return;
        const book = match[1], start = parseInt(match[2],10), end = match[3]?parseInt(match[3],10):start;
        const href = logosHref(book, start, end);
        if(href){
          a.removeAttribute('target');
          a.removeAttribute('rel');
          a.href = href;
          a.textContent = 'Open in Logos (ESV)';
        }
      });

      // Modal link label if it points to Logos
      const modalLink = document.getElementById('modalLink');
      if(modalLink && modalLink.href && modalLink.href.startsWith('logosres:')){
        modalLink.textContent = 'Open in Logos (ESV)';
      }
    }catch(e){
      // silent
    }
  }

  // Run after initial render and also on user switches
  document.addEventListener('DOMContentLoaded', upgradeLinks);
  // Try again shortly in case the app renders after load
  setTimeout(upgradeLinks, 1200);
  setInterval(upgradeLinks, 3000);
})();
