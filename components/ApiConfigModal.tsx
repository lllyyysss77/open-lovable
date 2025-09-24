import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { X, Settings, Check } from 'lucide-react';

interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ApiConfig) => void;
  currentConfig: ApiConfig;
}

const COMMON_MODELS = [
  'gpt-4o',
  'gpt-4o-mini', 
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307',
  'gemini-pro',
  'deepseek-chat',
  'qwen-plus',
  'moonshot-v1-8k',
  'yi-large',
  'custom-model'
];

const PRESET_APIS = [
  { name: 'OpenAI', url: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { name: 'DeepSeek', url: 'https://api.deepseek.com/v1', models: ['deepseek-chat'] },
  { name: 'Moonshot', url: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] },
  { name: 'Qwen', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-plus', 'qwen-turbo'] },
  { name: '零一万物', url: 'https://api.lingyiwanwu.com/v1', models: ['yi-large', 'yi-medium'] },
  { name: '自定义', url: '', models: [] }
];

export default function ApiConfigModal({ isOpen, onClose, onSave, currentConfig }: ApiConfigModalProps) {
  const [config, setConfig] = useState<ApiConfig>(currentConfig);
  const [selectedPreset, setSelectedPreset] = useState('自定义');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(currentConfig);
      // 检测当前配置属于哪个预设
      const preset = PRESET_APIS.find(p => p.url === currentConfig.apiUrl);
      setSelectedPreset(preset?.name || '自定义');
      setTestResult(null);
    }
  }, [isOpen, currentConfig]);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = PRESET_APIS.find(p => p.name === presetName);
    if (preset && preset.url) {
      setConfig(prev => ({
        ...prev,
        apiUrl: preset.url,
        model: preset.models[0] || prev.model
      }));
    }
  };

  const testConnection = async () => {
    if (!config.apiUrl || !config.apiKey) {
      setTestResult({ success: false, message: '请填写 API 地址和密钥' });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-api-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.success ? '连接测试成功！' : result.error || '连接测试失败'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: '连接测试失败: ' + (error as Error).message
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
    if (!config.apiUrl || !config.apiKey || !config.model) {
      setTestResult({ success: false, message: '请填写所有必需字段' });
      return;
    }
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">API 配置</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* 预设选择 */}
          <div className="space-y-2">
            <Label>选择 API 提供商</Label>
            <Select 
              value={selectedPreset} 
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              {PRESET_APIS.map(preset => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </Select>
          </div>

          {/* API 地址 */}
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API 地址 *</Label>
            <Input
              id="apiUrl"
              type="url"
              placeholder="https://api.openai.com/v1"
              value={config.apiUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
            />
          </div>

          {/* API 密钥 */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API 密钥 *</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>

          {/* 模型选择 */}
          <div className="space-y-2">
            <Label htmlFor="model">模型 *</Label>
            <Select 
              value={config.model} 
              onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
            >
              {COMMON_MODELS.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </Select>
            {config.model === 'custom-model' && (
              <Input
                placeholder="输入自定义模型名称"
                value={config.model === 'custom-model' ? '' : config.model}
                onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                className="mt-2"
              />
            )}
          </div>

          {/* 连接测试 */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={isTestingConnection || !config.apiUrl || !config.apiKey}
              className="w-full"
            >
              {isTestingConnection ? '测试中...' : '测试连接'}
            </Button>
            
            {testResult && (
              <div className={`flex items-center gap-2 text-sm p-2 rounded ${
                testResult.success 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {testResult.success ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {testResult.message}
              </div>
            )}
          </div>

          {/* 说明文字 */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded">
            <p className="font-medium mb-1">支持的 API：</p>
            <ul className="space-y-1">
              <li>• OpenAI 官方 API</li>
              <li>• 兼容 OpenAI 格式的第三方 API</li>
              <li>• 国内大模型 API（如 DeepSeek、月之暗面等）</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button onClick={handleSave} className="flex-1">
            保存配置
          </Button>
        </div>
      </div>
    </div>
  );
}