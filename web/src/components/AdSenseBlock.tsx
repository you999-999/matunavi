/**
 * AdSenseBlock コンポーネント
 * 
 * Google AdSense 自動広告を動的に読み込んで表示するコンポーネント
 * AdSenseポリシー違反を解消するため、条件付きで表示される
 */

import { useEffect, useRef } from 'react';

/**
 * AdSenseBlock コンポーネント
 * 
 * AdSense自動広告のスクリプトを動的に読み込み、広告を表示する
 * - script タグを動的に追加
 * - adsbygoogle.push({}) を呼び出して広告を初期化
 * - UIは div 1つだけ、装飾なし
 */
const AdSenseBlock: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    // スクリプトが既に読み込まれている場合はスキップ
    if (scriptLoadedRef.current) {
      return;
    }

    // AdSense スクリプトを動的に読み込む
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5451753995691217';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // スクリプト読み込み完了後、adsbygoogle.push({}) を呼び出して広告を初期化
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        try {
          window.adsbygoogle.push({});
        } catch (error) {
          console.error('AdSense 初期化エラー:', error);
        }
      }
    };

    document.head.appendChild(script);
    scriptLoadedRef.current = true;

    // クリーンアップ関数（コンポーネントのアンマウント時にスクリプトを削除しない）
    // スクリプトは一度読み込めば再利用できるため、削除しない
    return () => {
      // スクリプトは削除しない（他の AdSenseBlock で再利用される可能性があるため）
    };
  }, []);

  // 広告表示用の div（装飾なし）
  return (
    <div ref={adRef} className="adsbygoogle-container">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5451753995691217"
        data-ad-slot=""
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseBlock;
