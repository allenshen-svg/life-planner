/* ═══ 时光记 · Vue App ═══ */
const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

const API = '';  // unused, kept for compat

// ─── localStorage helpers ───
function lsLoad(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
function lsSave(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }
function lsObj(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }

// ─── Avatar Gallery ───
const AVATARS = [
  '🐱','🐶','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐸','🐧','🐦','🦄','🐝','🐙','🦋',
  '🌸','🌻','🌈','⭐','🍀','🎀','🧸','🎨',
  '🎵','🌙','☀️','🍎','🍩','🧁','🎪','🪐',
];

const MOODS = [
  { key: 'great',   emoji: '😄', label: '很棒' },
  { key: 'good',    emoji: '🙂', label: '不错' },
  { key: 'neutral', emoji: '😐', label: '一般' },
  { key: 'sad',     emoji: '😔', label: '低落' },
  { key: 'angry',   emoji: '😤', label: '生气' },
  { key: 'anxious', emoji: '😰', label: '焦虑' },
  { key: 'love',    emoji: '🥰', label: '幸福' },
];

const ALL_TAGS = ['读书','健身','跑步','约会','工作','学习','旅行','购物','美食','电影','音乐','游戏','家务','发呆','加班','聚餐'];

// ─── 预设活动（分类） ───
const ACTIVITY_GROUPS = [
  { label: '🔥 热门', items: ['逛展览','吃火锅','遛狗','逛公园','跑步','喝咖啡','看电影','露营','探店打卡','骑行'] },
  { label: '🍜 美食', items: ['吃火锅','吃烧烤','喝咖啡','吃日料','吃西餐','喝下午茶','吃早茶','吃川菜','吃粤菜','探店打卡','吃甜品','喝奶茶'] },
  { label: '🛍 购物', items: ['逛商场','逛超市','逛市集','买衣服','逛书店','逛花市'] },
  { label: '🎬 文娱', items: ['看电影','逛展览','看演出','听音乐会','看话剧','逛博物馆','逛美术馆','看脱口秀','唱K','密室逃脱','剧本杀'] },
  { label: '🏃 运动', items: ['跑步','健身','游泳','打羽毛球','打篮球','骑行','爬山','瑜伽','滑板','攀岩','飞盘'] },
  { label: '🌳 户外', items: ['逛公园','野餐','露营','钓鱼','遛狗','散步','骑车兜风','看日落','放风筝'] },
  { label: '👫 社交', items: ['朋友聚餐','家庭聚会','约会','见客户','团建','轰趴'] },
  { label: '🏠 生活', items: ['理发','看医生','洗车','搬家','做家务','寄快递','办证件'] },
  { label: '📚 学习', items: ['上课','自习','开会','面试','写代码','画画','弹琴','练字'] },
  { label: '✈️ 旅行', items: ['坐高铁','坐飞机','自驾游','逛景点','泡温泉','住民宿'] },
];
// flat list for search
const ACTIVITIES = ACTIVITY_GROUPS.flatMap(g => g.items);

// ─── 城市列表 ───
const CITIES = [
  '上海','北京','广州','深圳','杭州','成都','南京','武汉','重庆','西安',
  '苏州','长沙','青岛','厦门','大连','昆明','三亚','贵阳','郑州','天津',
  '哈尔滨','沈阳','济南','福州','合肥','南昌','无锡','东莞','宁波','佛山',
  '珠海','中山','惠州','常州','温州','绍兴','嘉兴','烟台','威海','桂林',
  '丽江','大理','拉萨','敦煌','张家界','黄山','洛阳','泉州','香港','澳门','台北',
];

// ─── 热门地标 ───
const LANDMARKS = {
  '上海': ['南京路步行街','外滩','陆家嘴','豫园','田子坊','新天地','静安寺','武康路','淮海中路','人民广场','上海迪士尼','环球港','大悦城','龙华寺','世博源','中山公园','虹桥天地','七宝古镇','朱家角','Columbia Circle','安福路','长乐路','愚园路','南京西路','徐家汇','五角场','金桥','前滩太古里','北外滩','西岸','M50','1933老场坊','思南公馆','上海图书馆','复兴公园','衡山路','永康路','甜爱路'],
  '北京': ['故宫','天安门广场','颐和园','南锣鼓巷','王府井','三里屯','后海','798艺术区','圆明园','鸟巢','天坛','前门大街','五道营胡同','簋街','国贸','望京','西单','蓝色港湾','朝阳大悦城','什刹海','烟袋斜街','北海公园','恭王府','雍和宫'],
  '广州': ['北京路步行街','珠江新城','天河城','正佳广场','沙面','荔枝湾','陈家祠','中山纪念堂','上下九','白云山','广州塔','花城汇','太古汇','东山口','永庆坊','小蛮腰','天河体育中心','岭南印象园'],
  '深圳': ['东门步行街','华强北','南山','海岸城','万象城','世界之窗','欢乐谷','大梅沙','海上世界','深圳湾公园','莲花山公园','东部华侨城','甘坑客家小镇','中心书城','海雅缤纷城','壹方城','万象天地','前海'],
  '杭州': ['西湖','河坊街','南宋御街','灵隐寺','龙井村','断桥','雷峰塔','湖滨银泰','武林广场','钱江新城','西溪湿地','良渚古城','天目山路','万象城','来福士','滨江宝龙城','拱墅万达'],
  '成都': ['春熙路','太古里','宽窄巷子','锦里','武侯祠','大熊猫基地','人民公园','文殊院','九眼桥','玉林路','IFS','天府广场','建设路','望平街','东郊记忆','三圣花乡','言几又','方所'],
  '南京': ['新街口','夫子庙','秦淮河','中山陵','玄武湖','总统府','老门东','鸡鸣寺','先锋书店','德基广场','紫峰大厦','南京眼','1912街区','明故宫','牛首山','百家湖'],
  '武汉': ['户部巷','黄鹤楼','楚河汉街','东湖','光谷','江汉路步行街','武汉长江大桥','昙华林','汉正街','武汉天地','汉口江滩','古德寺','武汉大学'],
  '重庆': ['解放碑','洪崖洞','磁器口','长江索道','观音桥','南山一棵树','鹅岭二厂','交通茶馆','来福士','李子坝站','十八梯','山城步道','龙门浩老街','弹子石老街'],
  '西安': ['大雁塔','回民街','钟楼鼓楼','城墙','陕西历史博物馆','大唐不夜城','永兴坊','小寨','曲江池','大明宫','长安十二时辰','赛格国际','高新万达'],
  '苏州': ['拙政园','平江路','观前街','虎丘','寒山寺','山塘街','金鸡湖','诚品书店','狮子林','留园','周庄','同里古镇','木渎古镇','苏州中心'],
  '长沙': ['五一广场','太平老街','岳麓山','橘子洲','IFS','国金中心','坡子街','黄兴路步行街','梅溪湖','湖南省博物馆','文和友','茶颜悦色(总店)'],
  '三亚': ['亚龙湾','海棠湾','天涯海角','南山寺','蜈支洲岛','第一市场','大东海','后海村','千古情景区','免税城','鹿回头','凤凰岛'],
  '厦门': ['鼓浪屿','中山路','曾厝垵','南普陀寺','厦门大学','环岛路','沙坡尾','八市','万象城','集美学村','五缘湾','筼筜湖'],
};
// Helper: get landmarks for current city + generic places
function getCityLandmarks(city) {
  return LANDMARKS[city] || [];
}

function toLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() { return toLocalDate(new Date()); }

function formatDate(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toLocalDate(d);
}

const app = createApp({
  setup() {
    // ─── Onboarding / Profile ───
    const profile = ref(lsObj('lp_profile'));
    const showOnboarding = ref(!profile.value);
    const onboardStep = ref(1);  // 1=nickname, 2=avatar, 3=age
    const obNickname = ref('');
    const obAvatar = ref('🐱');
    const obAge = ref('');

    function onboardNext() {
      if (onboardStep.value === 1) {
        if (!obNickname.value.trim()) return;
        onboardStep.value = 2;
      } else if (onboardStep.value === 2) {
        onboardStep.value = 3;
      } else {
        const p = {
          nickname: obNickname.value.trim(),
          avatar: obAvatar.value,
          age: obAge.value ? parseInt(obAge.value) : null,
        };
        localStorage.setItem('lp_profile', JSON.stringify(p));
        profile.value = p;
        showOnboarding.value = false;
      }
    }
    function onboardBack() {
      if (onboardStep.value > 1) onboardStep.value--;
    }

    const tab = ref('plan');
    const aiProvider = ref(localStorage.getItem('lp_aiProvider') || 'deepseek');

    watch(aiProvider, v => localStorage.setItem('lp_aiProvider', v));

    // ─── Plan ───
    const planDate = ref(today());
    const planCity = ref(localStorage.getItem('lp_city') || '上海');
    const plans = ref([]);
    const showPlanModal = ref(false);
    const editingPlan = ref(null);
    const planForm = ref(emptyPlanForm());

    function nowTime() {
      const d = new Date();
      return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    }
    function plusHours(t, h) {
      const [hh, mm] = t.split(':').map(Number);
      const nh = Math.min(hh + h, 23);
      return String(nh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    }

    function emptyPlanForm() {
      const t = nowTime();
      return { date: today(), time_start: t, time_end: plusHours(t, 2), title: '', location: '', city: planCity.value, category: 'other', notes: '' };
    }

    // ─── Quick Action Cards ───
    const QUICK_ACTIONS = [
      { emoji: '📈', title: '今日投资计划', cat: 'work' },
      { emoji: '🏃', title: '跑步', cat: 'exercise' },
      { emoji: '💪', title: '健身', cat: 'exercise' },
      { emoji: '📚', title: '读书学习', cat: 'work' },
      { emoji: '🍜', title: '约饭', cat: 'food' },
      { emoji: '☕', title: '喝咖啡', cat: 'food' },
      { emoji: '🎬', title: '看电影', cat: 'other' },
      { emoji: '🧘', title: '瑜伽冥想', cat: 'exercise' },
    ];
    function quickAdd(action) {
      planForm.value = { ...emptyPlanForm(), date: planDate.value, city: planCity.value, title: action.title, category: action.cat };
      activityQuery.value = action.title;
      editingPlan.value = null;
      showPlanModal.value = true;
    }

    // ─── Activity search ───
    const activityQuery = ref('');
    const activityTab = ref(0); // index into ACTIVITY_GROUPS
    const showActivityDropdown = ref(false);
    const filteredActivities = computed(() => {
      const q = activityQuery.value.trim();
      if (!q) return ACTIVITIES;
      return ACTIVITIES.filter(a => a.includes(q));
    });
    function selectActivity(a) {
      planForm.value.title = a;
      activityQuery.value = a;
      showActivityDropdown.value = false;
      // auto-set category
      const catMap = { '吃':'food','喝':'food','探店':'food','逛商':'shopping','逛超':'shopping','逛市':'shopping','买':'shopping','逛书':'shopping','逛花':'shopping','看电':'other','逛展':'other','看演':'other','听':'other','看话':'other','逛博':'other','逛美':'other','看脱':'other','唱':'other','密室':'other','剧本':'other','跑步':'exercise','健身':'exercise','游泳':'exercise','打':'exercise','骑行':'exercise','爬山':'exercise','瑜伽':'exercise','滑板':'exercise','攀岩':'exercise','飞盘':'exercise','逛公':'other','野餐':'travel','露营':'travel','钓鱼':'other','遛狗':'other','散步':'exercise','朋友':'social','家庭':'social','约会':'social','见客':'work','团建':'social','轰趴':'social','上课':'work','自习':'work','开会':'work','面试':'work','写代':'work','坐':'travel','自驾':'travel','逛景':'travel','泡温':'travel','住民':'travel' };
      for (const [prefix, cat] of Object.entries(catMap)) {
        if (a.startsWith(prefix)) { planForm.value.category = cat; break; }
      }
    }

    // ─── Address autocomplete ───
    const addressQuery = ref('');
    const showAddressDropdown = ref(false);
    const addressSuggestions = ref([]);
    const addressLoading = ref(false);

    function onAddressInput() {
      const val = addressQuery.value;
      planForm.value.location = val;
      if (!val || val.length < 1) { addressSuggestions.value = []; showAddressDropdown.value = false; return; }
      const city = planForm.value.city || '上海';
      const landmarks = getCityLandmarks(city);
      const matches = landmarks.filter(l => l.includes(val));
      addressSuggestions.value = matches.slice(0, 8);
      showAddressDropdown.value = matches.length > 0;
    }
    function selectAddress(addr) {
      planForm.value.location = addr;
      addressQuery.value = addr;
      showAddressDropdown.value = false;
    }

    watch(planCity, v => localStorage.setItem('lp_city', v));

    const filteredPlans = computed(() => {
      const sorted = plans.value
        .filter(p => p.date === planDate.value)
        .sort((a, b) => (a.time_start || '').localeCompare(b.time_start || ''));
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].location && sorted[i + 1].location) {
          sorted[i]._nextLocation = sorted[i + 1].location;
        }
      }
      return sorted;
    });

    const next7Days = computed(() => {
      const labels = ['今天', '明天', '后天'];
      const weekDays = ['周日','周一','周二','周三','周四','周五','周六'];
      const res = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        res.push({
          date: toLocalDate(d),
          day: d.getDate(),
          label: i < 3 ? labels[i] : weekDays[d.getDay()],
        });
      }
      return res;
    });

    async function loadPlans() {
      plans.value = lsLoad('lp_plans');
    }

    async function savePlan() {
      const f = planForm.value;
      if (!f.title) return alert('请选择或输入活动');
      planCity.value = f.city || planCity.value;
      const all = lsLoad('lp_plans');
      if (editingPlan.value) {
        const idx = all.findIndex(p => p.id === editingPlan.value);
        if (idx >= 0) all[idx] = { ...f, id: editingPlan.value };
      } else {
        f.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        all.push(f);
      }
      lsSave('lp_plans', all);
      showPlanModal.value = false;
      editingPlan.value = null;
      activityQuery.value = '';
      addressQuery.value = '';
      planForm.value = emptyPlanForm();
      await loadPlans();
    }

    function editPlan(p) {
      editingPlan.value = p.id;
      planForm.value = { ...p };
      activityQuery.value = p.title;
      addressQuery.value = p.location || '';
      showPlanModal.value = true;
    }

    async function deletePlan(id) {
      if (!confirm('删除这个计划？')) return;
      const all = lsLoad('lp_plans').filter(p => p.id !== id);
      lsSave('lp_plans', all);
      await loadPlans();
    }

    // ─── Share ───
    async function sharePlan(p) {
      const text = `📌 ${p.date} ${p.time_start}-${p.time_end}\n${p.title}${p.location ? ' @ ' + p.location : ''}${p.city ? ' · ' + p.city : ''}\n\n— 来自「时光记」`;
      if (navigator.share) {
        try {
          await navigator.share({ title: '时光记 · 计划分享', text });
        } catch(e) {}
      } else {
        try {
          await navigator.clipboard.writeText(text);
          alert('已复制到剪贴板，可以发给朋友啦');
        } catch(e) {
          prompt('复制以下内容分享给朋友：', text);
        }
      }
    }

    // ─── Diary ───
    const diaryEntries = ref([]);
    const showDiaryModal = ref(false);
    const editingDiary = ref(null);
    const diaryForm = ref(emptyDiaryForm());

    function emptyDiaryForm() {
      return { date: today(), mood: 'good', tags: [], content: '' };
    }

    async function loadDiary() {
      const all = lsLoad('lp_diary');
      diaryEntries.value = all.sort((a, b) => b.date.localeCompare(a.date));
    }

    async function saveDiary() {
      const f = diaryForm.value;
      if (!f.content) return alert('请写点什么吧');
      const all = lsLoad('lp_diary');
      if (editingDiary.value) {
        const idx = all.findIndex(e => e.id === editingDiary.value);
        if (idx >= 0) all[idx] = { ...f, id: editingDiary.value };
      } else {
        f.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        all.push(f);
      }
      lsSave('lp_diary', all);
      showDiaryModal.value = false;
      editingDiary.value = null;
      diaryForm.value = emptyDiaryForm();
      await loadDiary();
    }

    function editDiary(e) {
      editingDiary.value = e.id;
      diaryForm.value = { date: e.date, mood: e.mood, tags: [...(e.tags||[])], content: e.content };
      showDiaryModal.value = true;
    }

    async function deleteDiary(id) {
      if (!confirm('删除这条日记？')) return;
      const all = lsLoad('lp_diary').filter(e => e.id !== id);
      lsSave('lp_diary', all);
      await loadDiary();
    }

    function toggleTag(t) {
      const idx = diaryForm.value.tags.indexOf(t);
      if (idx >= 0) diaryForm.value.tags.splice(idx, 1);
      else diaryForm.value.tags.push(t);
    }

    function moodEmoji(key) {
      return MOODS.find(m => m.key === key)?.emoji || '😐';
    }

    // ─── Calendar / Review ───
    const calYear = ref(new Date().getFullYear());
    const calMonth = ref(new Date().getMonth());
    const reviewDate = ref('');
    const reviewDayPlans = ref([]);
    const reviewDayDiary = ref([]);

    const calDays = computed(() => {
      const first = new Date(calYear.value, calMonth.value, 1);
      const startDay = first.getDay();
      const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate();
      const prevDays = new Date(calYear.value, calMonth.value, 0).getDate();
      const todayStr = today();
      const planDates = new Set(plans.value.map(p => p.date));
      const diaryDates = new Set(diaryEntries.value.map(e => e.date));
      const days = [];

      for (let i = startDay - 1; i >= 0; i--) {
        const num = prevDays - i;
        const d = new Date(calYear.value, calMonth.value - 1, num);
        const ds = toLocalDate(d);
        days.push({ num, date: ds, otherMonth: true, isToday: false, hasPlan: planDates.has(ds), hasDiary: diaryDates.has(ds) });
      }
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(calYear.value, calMonth.value, i);
        const ds = toLocalDate(d);
        days.push({ num: i, date: ds, otherMonth: false, isToday: ds === todayStr, hasPlan: planDates.has(ds), hasDiary: diaryDates.has(ds) });
      }
      const remaining = 42 - days.length;
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(calYear.value, calMonth.value + 1, i);
        const ds = toLocalDate(d);
        days.push({ num: i, date: ds, otherMonth: true, isToday: false, hasPlan: planDates.has(ds), hasDiary: diaryDates.has(ds) });
      }
      return days;
    });

    function calPrev() {
      if (calMonth.value === 0) { calMonth.value = 11; calYear.value--; }
      else calMonth.value--;
    }
    function calNext() {
      if (calMonth.value === 11) { calMonth.value = 0; calYear.value++; }
      else calMonth.value++;
    }

    function loadReviewDay() {
      reviewDayPlans.value = plans.value.filter(p => p.date === reviewDate.value);
      reviewDayDiary.value = diaryEntries.value.filter(e => e.date === reviewDate.value);
    }

    // ─── AI ───
    const aiPlanResult = ref('');
    const aiPlanLoading = ref(false);
    const aiTransportResult = ref('');
    const aiTransportLoading = ref(false);
    const aiReviewResult = ref('');
    const aiReviewLoading = ref(false);

    async function aiPost(url, body) {
      // AI features disabled in static mode
      return { error: 'AI 功能暂不可用（静态部署模式）' };
    }

    async function getHotActivities() {
      aiPlanResult.value = '提示：静态部署模式下 AI 功能暂不可用，请直接从下方活动列表选择';
    }

    async function getSuggestPlaces(cat) {
      aiPlanResult.value = '提示：静态部署模式下 AI 功能暂不可用';
    }

    async function getTransport(from, to) {
      aiTransportResult.value = '提示：静态部署模式下 AI 功能暂不可用';
    }

    async function getLifeReview(period) {
      aiReviewResult.value = '提示：静态部署模式下 AI 功能暂不可用';
    }

    // ─── Init ───
    onMounted(() => {
      loadPlans();
      loadDiary();
    });

    // When switching to plan tab, open modal with city prefilled
    watch(showPlanModal, v => {
      if (v && !editingPlan.value) {
        planForm.value = { ...emptyPlanForm(), date: planDate.value, city: planCity.value };
        activityQuery.value = '';
        addressQuery.value = '';
        showActivityDropdown.value = false;
        showAddressDropdown.value = false;
        addressSuggestions.value = [];
      }
    });

    return {
      // Onboarding
      showOnboarding, onboardStep, obNickname, obAvatar, obAge,
      onboardNext, onboardBack, profile,
      avatars: AVATARS,
      quickActions: QUICK_ACTIONS, quickAdd,
      tab, aiProvider,
      // Plan
      planDate, planCity, plans, filteredPlans, next7Days,
      showPlanModal, editingPlan, planForm,
      savePlan, editPlan, deletePlan, sharePlan,
      // Activity selector
      activityQuery, activityTab, showActivityDropdown, filteredActivities, selectActivity,
      ACTIVITY_GROUPS, ACTIVITIES, CITIES,
      // Address autocomplete
      addressQuery, showAddressDropdown, addressSuggestions, addressLoading,
      onAddressInput, selectAddress,
      // Diary
      diaryEntries, showDiaryModal, editingDiary, diaryForm,
      saveDiary, editDiary, deleteDiary, toggleTag, moodEmoji,
      moods: MOODS, allTags: ALL_TAGS,
      // Calendar
      calYear, calMonth, calDays, calPrev, calNext,
      reviewDate, reviewDayPlans, reviewDayDiary, loadReviewDay,
      // AI
      aiPlanResult, aiPlanLoading,
      aiTransportResult, aiTransportLoading,
      aiReviewResult, aiReviewLoading,
      getHotActivities, getSuggestPlaces, getTransport, getLifeReview,
    };
  }
});

app.mount('#app');
