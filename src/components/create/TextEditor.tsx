import React from 'react';
import { Textarea } from '@/components/ui/Textarea';

interface TextEditorProps {
  content: string;
  onChangeContent: (val: string) => void;
  error?: string;
}

export function TextEditor({
  content,
  onChangeContent,
  error,
}: TextEditorProps) {
  return (
    <div className="space-y-2">
      <div>
        <Textarea
          placeholder="Paste or type text, code, notes, logs here..."
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          rows={14}
          error={error}
          className="font-mono text-sm leading-relaxed"
        />
        <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-1 px-1">
          <span>{content.length} characters</span>
          <span>{content.split('\n').length} lines</span>
        </div>
      </div>
    </div>
  );
}
