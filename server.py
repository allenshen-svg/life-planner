"""时光记 - Life Planner & Diary Server"""
import os, json, datetime, uuid
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from urllib import request as _urllib_req, error as _urllib_err

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

DATA_DIR = Path(__file__).parent / 'data'
DATA_DIR.mkdir(exist_ok=True)

PLANS_FILE = DATA_DIR / 'plans.json'
DIARY_FILE = DATA_DIR / 'diary.json'

# ─── helpers ───
def _load(path):
    if path.exists():
        return json.loads(path.read_text('utf-8'))
    return []

def _save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), 'utf-8')

# ─── AI config ───
_AI_PROVIDERS = {
    'deepseek': 'https://api.deepseek.com/v1/chat/completions',
    'zhipu': 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    'siliconflow': 'https://api.siliconflow.cn/v1/chat/completions',
}

def _get_ai_key(provider):
    mapping = {
        'deepseek': ('DEEPSEEK_API_KEY', 'sk-1986e1cd1169405f96649311dcfc76aa'),
        'zhipu': ('AI_API_KEY', ''),
        'siliconflow': ('SILICONFLOW_API_KEY', ''),
    }
    env_key, default = mapping.get(provider, ('', ''))
    return os.environ.get(env_key, default) if env_key else ''

def _call_ai(messages, provider='deepseek', model='deepseek-chat', temperature=0.7, max_tokens=4096):
    api_url = _AI_PROVIDERS.get(provider)
    api_key = _get_ai_key(provider)
    if not api_url or not api_key:
        return None
    body = json.dumps({
        'model': model, 'messages': messages,
        'temperature': temperature, 'max_tokens': min(max_tokens, 8192),
    }, ensure_ascii=False).encode('utf-8')
    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'}
    req = _urllib_req.Request(api_url, data=body, headers=headers, method='POST')
    try:
        with _urllib_req.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return result.get('choices', [{}])[0].get('message', {}).get('content', '')
    except Exception as e:
        print(f'[AI] error: {e}')
        return None

# ══════════════════════ PLAN CRUD ══════════════════════
@app.route('/api/plans', methods=['GET'])
def get_plans():
    date = request.args.get('date', '')
    plans = _load(PLANS_FILE)
    if date:
        plans = [p for p in plans if p.get('date') == date]
    return jsonify(plans)

@app.route('/api/plans', methods=['POST'])
def create_plan():
    data = request.get_json(force=True)
    plans = _load(PLANS_FILE)
    plan = {
        'id': str(uuid.uuid4())[:8],
        'date': data.get('date', datetime.date.today().isoformat()),
        'time_start': data.get('time_start', ''),
        'time_end': data.get('time_end', ''),
        'title': data.get('title', ''),
        'location': data.get('location', ''),
        'city': data.get('city', ''),
        'category': data.get('category', 'other'),
        'notes': data.get('notes', ''),
        'created_at': datetime.datetime.now().isoformat(),
    }
    plans.append(plan)
    _save(PLANS_FILE, plans)
    return jsonify(plan), 201

@app.route('/api/plans/<plan_id>', methods=['PUT'])
def update_plan(plan_id):
    data = request.get_json(force=True)
    plans = _load(PLANS_FILE)
    for p in plans:
        if p['id'] == plan_id:
            for k in ('date','time_start','time_end','title','location','city','category','notes'):
                if k in data:
                    p[k] = data[k]
            _save(PLANS_FILE, plans)
            return jsonify(p)
    return jsonify({'error': 'not found'}), 404

@app.route('/api/plans/<plan_id>', methods=['DELETE'])
def delete_plan(plan_id):
    plans = _load(PLANS_FILE)
    plans = [p for p in plans if p['id'] != plan_id]
    _save(PLANS_FILE, plans)
    return jsonify({'ok': True})

# ══════════════════════ DIARY CRUD ══════════════════════
@app.route('/api/diary', methods=['GET'])
def get_diary():
    date = request.args.get('date', '')
    month = request.args.get('month', '')  # YYYY-MM
    entries = _load(DIARY_FILE)
    if date:
        entries = [e for e in entries if e.get('date') == date]
    elif month:
        entries = [e for e in entries if e.get('date', '').startswith(month)]
    return jsonify(entries)

@app.route('/api/diary', methods=['POST'])
def create_diary():
    data = request.get_json(force=True)
    entries = _load(DIARY_FILE)
    entry = {
        'id': str(uuid.uuid4())[:8],
        'date': data.get('date', datetime.date.today().isoformat()),
        'mood': data.get('mood', 'neutral'),
        'tags': data.get('tags', []),
        'content': data.get('content', ''),
        'created_at': datetime.datetime.now().isoformat(),
    }
    entries.append(entry)
    _save(DIARY_FILE, entries)
    return jsonify(entry), 201

@app.route('/api/diary/<entry_id>', methods=['PUT'])
def update_diary(entry_id):
    data = request.get_json(force=True)
    entries = _load(DIARY_FILE)
    for e in entries:
        if e['id'] == entry_id:
            for k in ('date','mood','tags','content'):
                if k in data:
                    e[k] = data[k]
            _save(DIARY_FILE, entries)
            return jsonify(e)
    return jsonify({'error': 'not found'}), 404

@app.route('/api/diary/<entry_id>', methods=['DELETE'])
def delete_diary(entry_id):
    entries = _load(DIARY_FILE)
    entries = [e for e in entries if e['id'] != entry_id]
    _save(DIARY_FILE, entries)
    return jsonify({'ok': True})

# ══════════════════════ AI ENDPOINTS ══════════════════════
@app.route('/api/ai/suggest-places', methods=['POST'])
def ai_suggest_places():
    """根据地点/城市推荐附近好玩/好吃的地方"""
    data = request.get_json(force=True)
    city = data.get('city', '上海')
    location = data.get('location', '')
    category = data.get('category', 'food')
    prompt = f"""你是一个本地生活达人。用户在{city}{location}附近，
请推荐5个最近比较火的{'美食餐厅' if category=='food' else '好玩的地方/打卡点'}。
每个推荐格式：
1. **名称** - 一句话推荐理由 | 人均消费 | 距离参考
请用中文回答，推荐真实存在的热门地点。"""
    result = _call_ai([{'role': 'user', 'content': prompt}],
                      provider=data.get('provider', 'deepseek'),
                      model=data.get('model', 'deepseek-chat'))
    return jsonify({'suggestions': result or '暂时无法获取推荐，请稍后再试'})

@app.route('/api/ai/transport', methods=['POST'])
def ai_transport():
    """两地之间交通建议"""
    data = request.get_json(force=True)
    city = data.get('city', '上海')
    fr = data.get('from', '')
    to = data.get('to', '')
    prompt = f"""用户在{city}，需要从「{fr}」到「{to}」。
请给出3种交通方式建议，包括：
1. 推荐的交通方式（地铁/公交/打车/骑行/步行）
2. 大概耗时
3. 大概费用
4. 简短建议
用中文，简洁明了。"""
    result = _call_ai([{'role': 'user', 'content': prompt}],
                      provider=data.get('provider', 'deepseek'),
                      model=data.get('model', 'deepseek-chat'))
    return jsonify({'transport': result or '暂时无法获取建议'})

@app.route('/api/ai/hot-activities', methods=['POST'])
def ai_hot_activities():
    """城市近期热门活动"""
    data = request.get_json(force=True)
    city = data.get('city', '上海')
    prompt = f"""你是一个{city}本地生活资讯达人。请推荐{city}最近比较火的5个活动或打卡点，包括：
1. 活动/地点名称
2. 类型（展览/演出/市集/网红打卡/户外等）
3. 一句话推荐理由
4. 大概地址
用中文回答。"""
    result = _call_ai([{'role': 'user', 'content': prompt}],
                      provider=data.get('provider', 'deepseek'),
                      model=data.get('model', 'deepseek-chat'))
    return jsonify({'activities': result or '暂时无法获取活动信息'})

@app.route('/api/ai/life-review', methods=['POST'])
def ai_life_review():
    """AI 生活回顾与点评"""
    data = request.get_json(force=True)
    period = data.get('period', 'week')
    diary_entries = data.get('entries', [])
    plans = data.get('plans', [])

    diary_text = '\n'.join([
        f"[{e.get('date')}] 心情:{e.get('mood')} 标签:{','.join(e.get('tags',[]))} 内容:{e.get('content','')}"
        for e in diary_entries
    ]) or '暂无日记记录'
    plan_text = '\n'.join([
        f"[{p.get('date')}] {p.get('time_start','')}-{p.get('time_end','')} {p.get('title','')} @{p.get('location','')}"
        for p in plans
    ]) or '暂无计划记录'

    prompt = f"""你是一个温暖、有洞察力的生活导师。以下是用户最近{'一周' if period=='week' else '一个月'}的生活记录：

【日记记录】
{diary_text}

【计划安排】
{plan_text}

请你：
1. 用温暖的语气总结用户这段时间的生活状态
2. 从以下维度给出评价：身体健康、情绪状态、社交生活、个人成长、工作/学习
3. 给每个维度打分(1-10)
4. 给出3条具体可行的生活建议
5. 如果发现用户有负面情绪或困难（如失业、焦虑等），给出温暖的鼓励和实际建议

用中文回答，语气温暖友善但不虚浮。"""

    result = _call_ai([{'role': 'user', 'content': prompt}],
                      provider=data.get('provider', 'deepseek'),
                      model=data.get('model', 'deepseek-chat'),
                      max_tokens=4096)
    return jsonify({'review': result or '暂时无法生成回顾，请稍后再试'})

@app.route('/api/address-suggest', methods=['GET'])
def address_suggest():
    """AI-powered address autocomplete suggestions"""
    city = request.args.get('city', '上海')
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'suggestions': []})
    prompt = f'请列出{city}包含「{q}」的5个真实地点名称（商场、餐厅、景点、公园等均可），只返回地点名称，每行一个，不要编号不要解释。'
    result = _call_ai([{'role': 'user', 'content': prompt}],
                      provider='deepseek',
                      model='deepseek-chat',
                      max_tokens=256)
    print(f'[address-suggest] city={city} q={q} result={result!r}', flush=True)
    suggestions = [s.strip().lstrip('0123456789.、) ') for s in (result or '').split('\n') if s.strip()][:5]
    return jsonify({'suggestions': suggestions})

# ══════════════════════ STATIC ══════════════════════
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8095))
    print(f'✨ 时光记 server running on http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=True)
