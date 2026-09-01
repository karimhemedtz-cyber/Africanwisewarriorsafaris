/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Check,
  X,
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
}

const EMPTY_HTML = '<p><br></p>';

type ListType =
  | 'disc'
  | 'circle'
  | 'square'
  | 'decimal'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-roman'
  | 'upper-roman';

export default function RichTextEditor({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = 'Start writing...',
  readOnly = false,
  minHeight = '240px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeList, setActiveList] = useState<ListType | null>(null);
  const [openMenu, setOpenMenu] = useState<'bullet' | 'number' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const incoming = value || EMPTY_HTML;

    if (editorRef.current.innerHTML !== incoming) {
      editorRef.current.innerHTML = incoming;
    }

    updateToolbarState();
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const emitChange = () => {
    if (!editorRef.current) return;

    const html = editorRef.current.innerHTML;

    onChange(html === EMPTY_HTML ? '' : html);
    updateToolbarState();
  };

  const exec = (command: string, commandValue?: string) => {
    if (readOnly) return;

    editorRef.current?.focus();

    document.execCommand(command, false, commandValue);

    // Keep lists aligned with the paragraph alignment.
    if (
      command === 'justifyLeft' ||
      command === 'justifyCenter' ||
      command === 'justifyRight'
    ) {
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.anchorNode;

        if (node?.nodeType === Node.TEXT_NODE) {
          node = node.parentElement;
        }

        const element = node instanceof HTMLElement ? node : null;
        const list = element?.closest('ul, ol');

        if (list instanceof HTMLElement) {
          const alignment =
            command === 'justifyCenter'
              ? 'center'
              : command === 'justifyRight'
                ? 'right'
                : 'left';

          list.style.textAlign = alignment;
          list.style.listStylePosition = 'inside';

          list.querySelectorAll('li').forEach((item) => {
            (item as HTMLElement).style.textAlign = alignment;
          });
        }
      }
    }

    emitChange();
  };

  const handleInput = () => {
    emitChange();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      exec('insertText', '    ');
      return;
    }

    /*
     * Browser contentEditable already handles Enter naturally:
     * pressing Enter creates a new paragraph/list item.
     *
     * For lists, execCommand('insertUnorderedList') and
     * execCommand('insertOrderedList') preserve the list when
     * Enter is pressed, just like normal document editors.
     */
    if (event.key === 'Enter') {
      setTimeout(updateToolbarState, 0);
    }
  };

  const updateToolbarState = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      setActiveList(null);
      return;
    }

    let node: Node | null = selection.anchorNode;

    if (node?.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    const element = node instanceof HTMLElement ? node : null;

    const list = element?.closest('ul, ol');

    if (!list) {
      setActiveList(null);
      return;
    }

    const listStyle = window.getComputedStyle(list).listStyleType;

    const allowed: ListType[] = [
      'disc',
      'circle',
      'square',
      'decimal',
      'lower-alpha',
      'upper-alpha',
      'lower-roman',
      'upper-roman'
    ];

    setActiveList(
      allowed.includes(listStyle as ListType)
        ? (listStyle as ListType)
        : list.tagName === 'OL'
          ? 'decimal'
          : 'disc'
    );
  };

  const applyList = (type: ListType) => {
    if (readOnly) return;

    editorRef.current?.focus();

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    let node: Node | null = selection.anchorNode;

    if (node?.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    const element = node instanceof HTMLElement ? node : null;
    const existingList = element?.closest('ul, ol');

    const isOrdered = [
      'decimal',
      'lower-alpha',
      'upper-alpha',
      'lower-roman',
      'upper-roman'
    ].includes(type);

    const wantedTag = isOrdered ? 'OL' : 'UL';

    /*
     * If already inside the correct list type, only change
     * the numbering/bullet style.
     */
    if (existingList && existingList.tagName === wantedTag) {
      (existingList as HTMLElement).style.listStyleType = type;
      emitChange();
      setOpenMenu(null);
      return;
    }

    /*
     * If inside the opposite list type, convert it first.
     */
    if (existingList && existingList.tagName !== wantedTag) {
      document.execCommand(
        isOrdered ? 'insertOrderedList' : 'insertUnorderedList'
      );

      setTimeout(() => {
        const selectionAfter = window.getSelection();

        if (!selectionAfter || selectionAfter.rangeCount === 0) return;

        let currentNode: Node | null = selectionAfter.anchorNode;

        if (currentNode?.nodeType === Node.TEXT_NODE) {
          currentNode = currentNode.parentElement;
        }

        const currentElement =
          currentNode instanceof HTMLElement ? currentNode : null;

        const newList = currentElement?.closest('ul, ol');

        if (newList) {
          (newList as HTMLElement).style.listStyleType = type;
        }

        emitChange();
        setOpenMenu(null);
      }, 0);

      return;
    }

    /*
     * Create the requested list.
     */
    document.execCommand(
      isOrdered ? 'insertOrderedList' : 'insertUnorderedList'
    );

    setTimeout(() => {
      const selectionAfter = window.getSelection();

      if (!selectionAfter || selectionAfter.rangeCount === 0) return;

      let currentNode: Node | null = selectionAfter.anchorNode;

      if (currentNode?.nodeType === Node.TEXT_NODE) {
        currentNode = currentNode.parentElement;
      }

      const currentElement =
        currentNode instanceof HTMLElement ? currentNode : null;

      const newList = currentElement?.closest('ul, ol');

      if (newList) {
        (newList as HTMLElement).style.listStyleType = type;
      }

      emitChange();
      setOpenMenu(null);
    }, 0);
  };

  const isEmpty =
    !value ||
    value.replace(/<[^>]*>/g, '').trim().length === 0;

  return (
    <div
      ref={editorContainerRef}
      className={`w-full overflow-hidden border bg-white shadow-sm transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-[100] rounded-none border-0'
          : 'rounded-2xl'
      } ${
        isFocused
          ? 'border-brand-green ring-2 ring-brand-green/10'
          : 'border-stone-200'
      }`}
    >
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 p-2">
          <button
            type="button"
            title="Bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('bold')}
            className={`rounded-lg p-2 transition-colors ${
              document.queryCommandState?.('bold')
                ? 'bg-brand-green text-white'
                : 'text-stone-600 hover:bg-white hover:text-brand-green'
            }`}
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('italic')}
            className={`rounded-lg p-2 transition-colors ${
              document.queryCommandState?.('italic')
                ? 'bg-brand-green text-white'
                : 'text-stone-600 hover:bg-white hover:text-brand-green'
            }`}
          >
            <Italic className="h-4 w-4" />
          </button>

          <span className="mx-1 h-5 w-px bg-stone-200" />

          {/* BULLET LIST */}
          <div className="relative flex items-center">
            <button
              type="button"
              title="Bullet list"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyList('disc')}
              className={`rounded-l-lg p-2 transition-colors ${
                activeList === 'disc' ||
                activeList === 'circle' ||
                activeList === 'square'
                  ? 'bg-brand-green text-white'
                  : 'text-stone-600 hover:bg-white hover:text-brand-green'
              }`}
            >
              <List className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Bullet styles"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                setOpenMenu(openMenu === 'bullet' ? null : 'bullet')
              }
              className={`rounded-r-lg border-l border-white/30 p-2 transition-colors ${
                activeList === 'disc' ||
                activeList === 'circle' ||
                activeList === 'square'
                  ? 'bg-brand-green text-white'
                  : 'text-stone-600 hover:bg-white hover:text-brand-green'
              }`}
            >
              <ChevronDown className="h-3 w-3" />
            </button>

            <div
              id="rich-bullet-menu"
              className={`absolute left-0 top-10 z-50 min-w-[180px] rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl ${
                openMenu === 'bullet' ? 'block' : 'hidden'
              }`}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('disc')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100"
              >
                • Filled bullets
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('circle')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100"
              >
                ○ Circle bullets
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('square')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100"
              >
                ■ Square bullets
              </button>
            </div>
          </div>

          {/* NUMBER LIST */}
          <div className="relative flex items-center">
            <button
              type="button"
              title="Numbered list"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyList('decimal')}
              className={`rounded-l-lg p-2 transition-colors ${
                activeList === 'decimal' ||
                activeList === 'lower-alpha' ||
                activeList === 'upper-alpha' ||
                activeList === 'lower-roman' ||
                activeList === 'upper-roman'
                  ? 'bg-brand-green text-white'
                  : 'text-stone-600 hover:bg-white hover:text-brand-green'
              }`}
            >
              <ListOrdered className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Numbering styles"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                setOpenMenu(openMenu === 'number' ? null : 'number')
              }
              className={`rounded-r-lg border-l border-white/30 p-2 transition-colors ${
                activeList === 'decimal' ||
                activeList === 'lower-alpha' ||
                activeList === 'upper-alpha' ||
                activeList === 'lower-roman' ||
                activeList === 'upper-roman'
                  ? 'bg-brand-green text-white'
                  : 'text-stone-600 hover:bg-white hover:text-brand-green'
              }`}
            >
              <ChevronDown className="h-3 w-3" />
            </button>

            <div
              id="rich-number-menu"
              className={`absolute left-0 top-10 z-50 min-w-[190px] rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl ${
                openMenu === 'number' ? 'block' : 'hidden'
              }`}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('decimal')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100"
              >
                1. 2. 3. Numbers
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('lower-alpha')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100"
              >
                a. b. c. Lowercase letters
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('upper-alpha')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100"
              >
                A. B. C. Uppercase letters
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('lower-roman')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100"
              >
                i. ii. iii. Lowercase Roman
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('upper-roman')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100"
              >
                I. II. III. Uppercase Roman
              </button>
            </div>
          </div>

          <span className="mx-1 h-5 w-px bg-stone-200" />

          <button
            type="button"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpenMenu(null);
              setIsFullscreen(prev => !prev);
            }}
            className={`rounded-lg p-2 transition-colors ${
              isFullscreen
                ? 'bg-brand-green text-white'
                : 'text-stone-600 hover:bg-white hover:text-brand-green'
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          <span className="mx-1 h-5 w-px bg-stone-200" />

          <button
            type="button"
            title="Align left"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('justifyLeft')}
            className="rounded-lg p-2 text-stone-600 hover:bg-white hover:text-brand-green"
          >
            <AlignLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Align center"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('justifyCenter')}
            className="rounded-lg p-2 text-stone-600 hover:bg-white hover:text-brand-green"
          >
            <AlignCenter className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Align right"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('justifyRight')}
            className="rounded-lg p-2 text-stone-600 hover:bg-white hover:text-brand-green"
          >
            <AlignRight className="h-4 w-4" />
          </button>

          <span className="mx-1 h-5 w-px bg-stone-200" />

          <button
            type="button"
            title="Undo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('undo')}
            className="rounded-lg p-2 text-stone-600 hover:bg-white hover:text-brand-green"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Redo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('redo')}
            className="rounded-lg p-2 text-stone-600 hover:bg-white hover:text-brand-green"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative">
        {isEmpty && !isFocused && (
          <div className="pointer-events-none absolute left-4 top-4 text-sm text-stone-400">
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => {
            setIsFocused(true);
            updateToolbarState();
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(updateToolbarState, 0);
          }}
          onKeyUp={updateToolbarState}
          onMouseUp={updateToolbarState}
          onKeyDown={handleKeyDown}
          className={`prose prose-sm max-w-none overflow-y-auto px-4 py-4 text-stone-700 outline-none [&_ul]:list-inside [&_ol]:list-inside [&_ul]:my-2 [&_ol]:my-2 ${
            isFullscreen ? 'h-[calc(100vh-105px)]' : ''
          }`}
          style={{ minHeight: isFullscreen ? undefined : minHeight }}
        />
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 p-3">
{(onSave || onCancel) && (
            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-200"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}

              {onSave && (
                <button
                  type="button"
                  onClick={onSave}
                  className="flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-olive"
                >
                  <Check className="h-4 w-4" />
                  Save
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {false && (onSave || onCancel) && !readOnly && (
        <div className="flex items-center justify-end gap-2 border-t border-stone-200 bg-stone-50 p-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-200"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-olive"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          )}
        </div>
      )}
    </div>
  );
}
