# Google AdSense ポリシー違反 調査レポート

## 📋 調査概要

**否認理由:**
- パブリッシャーのコンテンツを含まない画面への広告表示
- 有用性の低いコンテンツへの広告表示

**調査日:** 2026年1月
**調査対象:** まつなび（医療機関検索サイト）

---

## 1. AdSenseコードの配置場所

### ✅ 確認結果

**ファイル:** `web/index.html` (24-29行目)

```html
<!-- Google AdSense 自動広告 -->
<script 
  async 
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5451753995691217" 
  crossorigin="anonymous"
></script>
```

**問題点:**
- **全ページで自動的に読み込まれる**（`<head>`内に配置）
- 自動広告はページ全体に広告を自動配置するため、コンテンツの有無に関係なく表示される可能性がある
- React SPAのため、ルート変更時も広告スクリプトは再読み込みされない（一度読み込まれたら常に有効）

---

## 2. 広告表示NG画面のチェックリスト

### 🔴 **重大な問題（即座に対応必須）**

#### 2.1 検索前の初期表示画面
**ファイル:** `web/src/components/search-ui-example.tsx`
**状態:** 
- `searchResults.length === 0` かつ検索未実行
- `selectedFacility === null`

**問題点:**
- 検索フォームのみで、実質的なコンテンツがない
- ユーザーが何も検索していない状態で広告が表示される可能性
- **AdSenseポリシー違反:** 「パブリッシャーのコンテンツを含まない画面」

**該当コード:**
```typescript
// 405-443行目
{!selectedFacility ? (
  <>
    {/* 検索条件 */}
    <SearchSidebar ... />
    
    {/* 検索結果 */}
    <SearchResults 
      results={searchResults}  // 初期状態は空配列 []
      onFacilityClick={setSelectedFacility}
    />
  </>
) : (
  <FacilityDetail ... />
)}
```

#### 2.2 検索結果0件の画面
**ファイル:** `web/src/components/search-ui-example.tsx` (777-780行目)

**問題点:**
- 「検索結果がありません」というメッセージのみ
- 実質的なコンテンツがない
- **AdSenseポリシー違反:** 「有用性の低いコンテンツ」

**該当コード:**
```typescript
{results.length === 0 ? (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <p className="text-gray-500">検索結果がありません</p>
  </div>
) : (
  // 検索結果一覧
)}
```

#### 2.3 ローディング中画面
**ファイル:** `web/src/components/search-ui-example.tsx`

**問題点:**
- 複数のローディング状態が存在
  - `isLoadingWaitTime` (890行目)
  - `isLoadingHourly` (894行目)
  - `isLoadingDayOfWeek` (898行目)
  - `isLoadingTimeSlot` (902行目)
  - `isLoadingDepartment` (906行目)
  - `isLoadingData` (916行目)

**該当コード:**
```typescript
// 1333行目付近
{isLoadingWaitTime ? (
  '読み込み中...'
) : (
  // コンテンツ表示
)}
```

**問題点:**
- 「読み込み中...」というテキストのみで、実質的なコンテンツがない
- ローディング中でも広告が表示される可能性

#### 2.4 モーダル表示中
**ファイル:** `web/src/components/search-ui-example.tsx` (1272-1300行目)

**問題点:**
- 成功メッセージモーダル表示中（`showSuccessMessage === true`）
- モーダルは `fixed inset-0` で全画面を覆うが、背景の広告は表示され続ける可能性
- **AdSenseポリシー違反:** 「パブリッシャーのコンテンツを含まない画面」

**該当コード:**
```typescript
{showSuccessMessage && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-12 max-w-md w-full mx-4">
      {/* 成功メッセージ */}
    </div>
  </div>
)}
```

#### 2.5 施設詳細表示中の投稿フォーム
**ファイル:** `web/src/components/search-ui-example.tsx` (1692行目以降)

**問題点:**
- 施設詳細表示中（`selectedFacility !== null`）でも、フォーム入力画面は「コンテンツ」とは見なされにくい
- ただし、施設詳細情報（待ち時間ヒートマップなど）が表示されている場合は問題ない可能性が高い

---

### 🟡 **要注意（確認推奨）**

#### 2.6 トップページ（Home.tsx）
**ファイル:** `web/src/pages/Home.tsx`

**状態:**
- サービス紹介、機能説明、CTAボタンなど、コンテンツは存在
- ただし、検索機能への導線のみで、実質的な検索結果がない

**評価:**
- コンテンツ量は十分（約300行のコンテンツ）
- ただし、AdSense審査では「検索結果がない状態」が問題視される可能性

---

## 3. React状態管理・条件分岐の観点から見た問題

### 3.1 広告が表示されてしまう可能性がある状態

#### ❌ **問題パターン1: 初期状態で広告表示**
```typescript
// search-ui-example.tsx
const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // 初期値: 空配列
const [selectedFacility, setSelectedFacility] = useState<SearchResult | null>(null); // 初期値: null

// 405行目: 初期状態では検索フォームのみ表示
{!selectedFacility ? (
  <SearchResults results={searchResults} /> // searchResults = []
) : (
  <FacilityDetail ... />
)}
```

**問題:**
- ページ読み込み直後、`searchResults` は空配列
- 検索実行前でも広告が表示される可能性

#### ❌ **問題パターン2: 検索結果0件で広告表示**
```typescript
// 777-780行目
{results.length === 0 ? (
  <div>検索結果がありません</div> // コンテンツが極端に少ない
) : (
  <div>検索結果一覧</div>
)}
```

**問題:**
- 検索結果が0件の場合、実質的なコンテンツがない
- 広告が表示されると「有用性の低いコンテンツ」と判断される

#### ❌ **問題パターン3: ローディング中に広告表示**
```typescript
// 1333行目付近
{isLoadingWaitTime ? (
  '読み込み中...' // テキストのみ
) : (
  // コンテンツ表示
)}
```

**問題:**
- ローディング中は「読み込み中...」というテキストのみ
- 実質的なコンテンツがない状態で広告が表示される

#### ❌ **問題パターン4: モーダル表示中に背景広告表示**
```typescript
// 1272行目付近
{showSuccessMessage && (
  <div className="fixed inset-0 ...">
    {/* モーダル */}
  </div>
)}
```

**問題:**
- モーダル表示中、背景の広告は表示され続ける可能性
- モーダルは「パブリッシャーのコンテンツ」とは見なされにくい

---

## 4. 広告を表示してよい画面 / 非表示にすべき画面

### ✅ **広告を表示してよい画面**

1. **トップページ（Home.tsx）**
   - サービス紹介、機能説明、CTAボタンなど、十分なコンテンツがある
   - **条件:** コンテンツ量が十分（約300行）

2. **検索結果が1件以上ある画面**
   - 検索結果一覧が表示されている
   - **条件:** `searchResults.length > 0` かつ `selectedFacility === null`

3. **施設詳細表示画面（コンテンツ表示中）**
   - 施設情報、待ち時間ヒートマップ、統計情報などが表示されている
   - **条件:** `selectedFacility !== null` かつ `isLoadingWaitTime === false` かつ `isLoadingHourly === false`

4. **静的ページ（About, FAQ, Terms, PrivacyPolicy）**
   - 十分なコンテンツがある
   - **条件:** コンテンツ量が十分

---

### ❌ **広告を非表示にすべき画面**

1. **検索前の初期表示画面**
   - **条件:** `searchResults.length === 0` かつ検索未実行
   - **理由:** 実質的なコンテンツがない

2. **検索結果0件の画面**
   - **条件:** `searchResults.length === 0` かつ検索実行済み
   - **理由:** 「検索結果がありません」のみで、有用性が低い

3. **ローディング中画面**
   - **条件:** いずれかの `isLoading*` が `true`
   - **理由:** 「読み込み中...」のみで、実質的なコンテンツがない

4. **モーダル表示中**
   - **条件:** `showSuccessMessage === true`
   - **理由:** モーダルは「パブリッシャーのコンテンツ」とは見なされにくい

5. **施設詳細表示中のローディング中**
   - **条件:** `selectedFacility !== null` かつ `isLoadingWaitTime === true` または `isLoadingHourly === true`
   - **理由:** ローディング中は実質的なコンテンツがない

---

## 5. 最小修正で対応できる方針案

### 5.1 方針: 条件分岐で広告表示を制御

**実装方法:**
1. AdSense自動広告を条件付きで読み込む
2. または、広告表示エリアを条件付きでレンダリング

### 5.2 具体的な実装案

#### 案1: 広告表示フラグを追加（推奨）

```typescript
// search-ui-example.tsx に追加
const [shouldShowAds, setShouldShowAds] = useState<boolean>(false);

// 広告表示条件を判定
useEffect(() => {
  // 検索結果が1件以上ある場合のみ広告表示
  if (searchResults.length > 0 && !selectedFacility) {
    setShouldShowAds(true);
  } else if (selectedFacility && !isLoadingWaitTime && !isLoadingHourly) {
    setShouldShowAds(true);
  } else {
    setShouldShowAds(false);
  }
}, [searchResults.length, selectedFacility, isLoadingWaitTime, isLoadingHourly]);
```

#### 案2: 広告コンポーネントを条件付きレンダリング

```typescript
// 広告表示コンポーネントを作成
const AdSensePlaceholder: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="adsbygoogle-container">
      {/* AdSense自動広告がここに表示される */}
    </div>
  );
};

// 使用例
<AdSensePlaceholder show={shouldShowAds} />
```

#### 案3: CSSで広告を非表示（緊急対応）

```css
/* 広告非表示用のクラス */
.hide-ads .adsbygoogle {
  display: none !important;
}
```

```typescript
// 条件に応じてクラスを追加
<div className={shouldShowAds ? '' : 'hide-ads'}>
  {/* コンテンツ */}
</div>
```

---

### 5.3 推奨実装手順

1. **広告表示フラグを追加**
   - `shouldShowAds` state を追加
   - 条件分岐で `true/false` を設定

2. **広告表示条件を明確化**
   - 検索結果が1件以上: `searchResults.length > 0`
   - 施設詳細表示中（ローディング完了）: `selectedFacility !== null && !isLoadingWaitTime && !isLoadingHourly`

3. **広告非表示条件を明確化**
   - 検索前: `searchResults.length === 0` かつ検索未実行
   - 検索結果0件: `searchResults.length === 0` かつ検索実行済み
   - ローディング中: いずれかの `isLoading*` が `true`
   - モーダル表示中: `showSuccessMessage === true`

4. **CSS/JavaScriptで広告を制御**
   - AdSense自動広告は `window.adsbygoogle` で制御可能
   - または、CSSで非表示にする

---

## 6. 問題の可能性がある箇所の一覧

| ファイル | 行番号 | 問題内容 | 優先度 |
|---------|--------|---------|--------|
| `web/index.html` | 24-29 | AdSense自動広告が全ページで読み込まれる | 🔴 高 |
| `web/src/components/search-ui-example.tsx` | 405-443 | 検索前の初期表示で広告が表示される可能性 | 🔴 高 |
| `web/src/components/search-ui-example.tsx` | 777-780 | 検索結果0件で広告が表示される可能性 | 🔴 高 |
| `web/src/components/search-ui-example.tsx` | 1333 | ローディング中に広告が表示される可能性 | 🔴 高 |
| `web/src/components/search-ui-example.tsx` | 1272-1300 | モーダル表示中に背景広告が表示される可能性 | 🔴 高 |
| `web/src/components/search-ui-example.tsx` | 890-916 | 複数のローディング状態で広告が表示される可能性 | 🟡 中 |

---

## 7. まとめ

### 主な問題点

1. **AdSense自動広告が全ページで無条件に読み込まれる**
   - `index.html` の `<head>` に配置されているため、コンテンツの有無に関係なく広告が表示される

2. **検索前・検索結果0件・ローディング中・モーダル表示中に広告が表示される可能性**
   - 実質的なコンテンツがない状態で広告が表示される
   - AdSenseポリシー違反の直接的な原因

3. **広告表示の制御ロジックが存在しない**
   - 現在、広告表示を制御するコードがない
   - 条件分岐で広告表示を制御する必要がある

### 推奨対応

1. **広告表示フラグを追加**
   - `shouldShowAds` state を追加
   - 条件分岐で `true/false` を設定

2. **広告表示条件を明確化**
   - 検索結果が1件以上: 広告表示OK
   - 施設詳細表示中（ローディング完了）: 広告表示OK
   - それ以外: 広告非表示

3. **広告非表示条件を明確化**
   - 検索前、検索結果0件、ローディング中、モーダル表示中: 広告非表示

---

**注意:** このレポートは調査と改善提案のみです。実装は別途検討してください。
