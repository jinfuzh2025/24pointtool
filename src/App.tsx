import React, { useState } from 'react';

// --- Core Algorithm ---
// If findAll = false, it stops searching once a solution is found
function solve(nums: number[], target: number, allowedOps: string[], findAll: boolean = false): string[] {
  const results = new Set<string>();
  
  function backtrack(currentItems: { val: number, exp: string }[]): boolean {
    if (currentItems.length === 1) {
      if (Math.abs(currentItems[0].val - target) < 1e-6) {
        results.add(currentItems[0].exp);
        return !findAll; // If we don't need all solutions, return true to trigger stop signal
      }
      return false;
    }
    
    for (let i = 0; i < currentItems.length; i++) {
      for (let j = 0; j < currentItems.length; j++) {
        if (i === j) continue;
        
        const a = currentItems[i];
        const b = currentItems[j];
        const remaining = currentItems.filter((_, idx) => idx !== i && idx !== j);
        const nextOps = [];
        
        if (allowedOps.includes('+')) nextOps.push({ val: a.val + b.val, exp: `(${a.exp}+${b.exp})` });
        if (allowedOps.includes('-')) nextOps.push({ val: a.val - b.val, exp: `(${a.exp}-${b.exp})` });
        if (allowedOps.includes('*')) nextOps.push({ val: a.val * b.val, exp: `(${a.exp}*${b.exp})` });
        if (allowedOps.includes('/') && Math.abs(b.val) > 1e-6) nextOps.push({ val: a.val / b.val, exp: `(${a.exp}/${b.exp})` });
        
        for (const next of nextOps) {
          if (backtrack([...remaining, next])) return true; // Propagate stop signal upwards
        }
      }
    }
    return false;
  }
  
  backtrack(nums.map(n => ({ val: n, exp: n.toString() })));
  return Array.from(results);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'calc' | 'gen'>('calc');

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#f5f5f5] font-sans text-gray-900">
      <div className="bg-white shadow-lg rounded-sm w-full max-w-md border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-3 text-center font-medium border-r border-gray-200 transition-colors ${
              activeTab === 'calc' ? 'bg-white text-black border-b-2 border-b-transparent' : 'bg-[#f1f1f1] text-[#666]'
            }`}
          >
            24点计算器
          </button>
          <button
            onClick={() => setActiveTab('gen')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'gen' ? 'bg-white text-black border-b-2 border-b-transparent' : 'bg-[#f1f1f1] text-[#666]'
            }`}
          >
            24点生成器
          </button>
        </div>

        {/* Content */}
        {activeTab === 'calc' ? <Calculator /> : <Generator />}
      </div>
    </div>
  );
}

function Calculator() {
  const [numCount, setNumCount] = useState(4);
  const [targetResult, setTargetResult] = useState<number | ''>(24);
  const [answerQty, setAnswerQty] = useState<'1' | 'all'>('1');
  const [nums, setNums] = useState<string[]>(Array(4).fill(''));
  const [ops, setOps] = useState<string[]>(['+', '-', '*', '/']);
  const [output, setOutput] = useState('');

  const handleNumCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setNumCount(count);
    setNums(Array(count).fill(''));
  };

  const handleNumChange = (index: number, value: string) => {
    const newNums = [...nums];
    newNums[index] = value;
    setNums(newNums);
  };

  const toggleOp = (op: string) => {
    if (ops.includes(op)) {
      setOps(ops.filter(o => o !== op));
    } else {
      setOps([...ops, op]);
    }
  };

  const handleCalc = () => {
    const parsedNums = nums.map(n => parseFloat(n)).filter(n => !isNaN(n));
    if (parsedNums.length < numCount) {
      setOutput(`请填写所有 ${numCount} 个数字`);
      return;
    }
    if (ops.length === 0) {
      setOutput("请至少选择一个运算符");
      return;
    }
    if (targetResult === '') {
      setOutput("请输入目标结果");
      return;
    }

    const res = solve(parsedNums, targetResult, ops, answerQty === 'all');
    setOutput(res.length ? res.join('\n') : "无解");
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `24点-calc-结果.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setOutput('');
    setNums(Array(numCount).fill(''));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex border border-gray-200 rounded-sm">
        <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">数字个数</label>
        <select value={numCount} onChange={handleNumCountChange} className="w-2/3 px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:border-teal-600">
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
        </select>
      </div>
      
      <div className="flex border border-gray-200 rounded-sm">
        <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">结果</label>
        <input 
          type="number" 
          value={targetResult} 
          onChange={e => setTargetResult(e.target.value === '' ? '' : parseFloat(e.target.value))} 
          className="w-2/3 px-3 py-2 text-sm focus:outline-none focus:border-teal-600" 
        />
      </div>

      <div className="flex border border-gray-200 rounded-sm">
        <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">答案数量</label>
        <select value={answerQty} onChange={e => setAnswerQty(e.target.value as '1' | 'all')} className="w-2/3 px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:border-teal-600">
          <option value="1">1个答案</option>
          <option value="all">所有答案</option>
        </select>
      </div>

      <div className="space-y-4">
        {nums.map((num, idx) => (
          <div key={idx} className="flex border border-gray-200 rounded-sm">
            <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">整数{idx + 1}</label>
            <input 
              type="number" 
              value={num} 
              onChange={e => handleNumChange(idx, e.target.value)} 
              placeholder="输入数字" 
              className="w-2/3 px-3 py-2 text-sm focus:outline-none focus:border-teal-600" 
            />
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="w-1/3 px-3 py-2 bg-gray-50 border border-gray-200 text-sm flex items-center">运算符</div>
        <div className="w-2/3 p-2 grid grid-cols-2 gap-2 border-y border-r border-gray-200">
          {['+', '-', '*', '/'].map(op => (
            <label key={op} className="flex items-center space-x-2 border p-1 rounded-sm cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={ops.includes(op)} onChange={() => toggleOp(op)} className="accent-teal-600" />
              <span className="text-xs bg-green-500 text-white w-5 h-5 flex items-center justify-center rounded-sm">{op}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button onClick={handleCalc} className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors">计算</button>
        <button onClick={handleCopy} className="px-6 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50 transition-colors">复制</button>
        <button onClick={handleDownload} className="px-6 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50 transition-colors">下载</button>
        <button onClick={handleClear} className="px-6 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50 transition-colors">清空</button>
      </div>

      <div className="border border-gray-200 rounded-sm overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 text-sm">计算结果</div>
        <textarea readOnly value={output} className="w-full h-40 p-3 text-sm font-mono resize-none focus:outline-none" placeholder="结果将显示在这里..."></textarea>
      </div>
    </div>
  );
}

function Generator() {
  const [numCount, setNumCount] = useState(4);
  const [maxVal, setMaxVal] = useState<number | ''>(13);
  const [qty, setQty] = useState<number | ''>(5);
  const [type, setType] = useState<'must' | 'any'>('must');
  const [targetResult, setTargetResult] = useState<number | ''>(24);
  const [ops, setOps] = useState<string[]>(['+', '-', '*', '/']);
  const [output, setOutput] = useState('');

  const toggleOp = (op: string) => {
    if (ops.includes(op)) {
      setOps(ops.filter(o => o !== op));
    } else {
      setOps([...ops, op]);
    }
  };

  const handleGen = () => {
    if (maxVal === '' || qty === '' || targetResult === '') {
      setOutput("请填写所有参数");
      return;
    }

    let generated = [];
    let attempts = 0;
    const maxAttempts = 2000;

    while (generated.length < qty && attempts < maxAttempts) {
      attempts++;
      let nums = Array.from({ length: numCount }, () => Math.floor(Math.random() * maxVal) + 1);
      
      if (type === 'must') {
        if (solve(nums, targetResult, ops, false).length > 0) {
          generated.push(nums.join(', '));
        }
      } else {
        generated.push(nums.join(', '));
      }
    }
    setOutput(generated.join('\n') + (attempts >= maxAttempts ? "\n(已尝试较多次，停止生成)" : ""));
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `24点-gen-结果.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setOutput('');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex border border-gray-200 rounded-sm">
        <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">数字个数</label>
        <select value={numCount} onChange={e => setNumCount(parseInt(e.target.value))} className="w-2/3 px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:border-teal-600">
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
        </select>
      </div>

      <div className="flex border border-gray-200 rounded-sm">
        <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">最大数值</label>
        <input 
          type="number" 
          value={maxVal} 
          onChange={e => setMaxVal(e.target.value === '' ? '' : parseInt(e.target.value))} 
          className="w-2/3 px-3 py-2 text-sm focus:outline-none focus:border-teal-600" 
        />
      </div>

      <div className="flex border border-gray-200 rounded-sm">
        <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">生成数量</label>
        <input 
          type="number" 
          value={qty} 
          onChange={e => setQty(e.target.value === '' ? '' : parseInt(e.target.value))} 
          className="w-2/3 px-3 py-2 text-sm focus:outline-none focus:border-teal-600" 
        />
      </div>

      <div className="flex border border-gray-200 rounded-sm">
        <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">答案类型</label>
        <select value={type} onChange={e => setType(e.target.value as 'must' | 'any')} className="w-2/3 px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:border-teal-600">
          <option value="must">必须有答案</option>
          <option value="any">随机生成</option>
        </select>
      </div>

      <div className="flex border border-gray-200 rounded-sm">
        <label className="w-1/3 px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm flex items-center">结果</label>
        <input 
          type="number" 
          value={targetResult} 
          onChange={e => setTargetResult(e.target.value === '' ? '' : parseFloat(e.target.value))} 
          className="w-2/3 px-3 py-2 text-sm focus:outline-none focus:border-teal-600" 
        />
      </div>

      <div className="flex">
        <div className="w-1/3 px-3 py-2 bg-gray-50 border border-gray-200 text-sm flex items-center">运算符</div>
        <div className="w-2/3 p-2 grid grid-cols-2 gap-2 border-y border-r border-gray-200">
          {['+', '-', '*', '/'].map(op => (
            <label key={op} className="flex items-center space-x-2 border p-1 rounded-sm cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={ops.includes(op)} onChange={() => toggleOp(op)} className="accent-teal-600" />
              <span className="text-xs bg-green-500 text-white w-5 h-5 flex items-center justify-center rounded-sm">{op}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button onClick={handleGen} className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors">生成</button>
        <button onClick={handleCopy} className="px-6 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50 transition-colors">复制</button>
        <button onClick={handleDownload} className="px-6 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50 transition-colors">下载</button>
        <button onClick={handleClear} className="px-6 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50 transition-colors">清空</button>
      </div>

      <div className="border border-gray-200 rounded-sm overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 text-sm">生成结果</div>
        <textarea readOnly value={output} className="w-full h-40 p-3 text-sm font-mono resize-none focus:outline-none" placeholder="生成结果将显示在这里..."></textarea>
      </div>
    </div>
  );
}
