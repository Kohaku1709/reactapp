# StayHTM - Do an Web Programming

## 1) Muc tieu cua du an
Du an mo phong mot website dat phong khach san bang React + Vite.
Ban nay duoc toi uu theo huong:
- Tach logic loc/sap xep de de bao tri.
- Tach CSS thanh nhom ro rang (base/layout/components/pages).
- Giai thich ro cac luong du lieu de de hoc.

## 2) Cau truc thu muc

```text
src/
  components/
    Footer.jsx
    HotelCard.jsx
    Navbar.jsx
    StarRating.jsx
  hooks/
    useResponsiveGridColumns.js
  pages/
    HomePage.jsx
    HotelsPage.jsx
    AboutPage.jsx
    ContactPage.jsx
    LoginPage.jsx
  styles/
    tokens.css
    layout.css
    components.css
    pages.css
  utils/
    hotelPricing.js
    hotelQuery.js
  App.jsx
  App.css
  data.js
  index.css
  main.jsx
```

## 3) Luong chay tong quan

### 3.1 Khoi dong app
1. `main.jsx` render `App` vao `#root`.
2. `App.jsx` cau hinh route va render `Navbar`, `Routes`, `Footer`.
3. `App.jsx` quan ly dang nhap gia lap qua `localStorage`.

### 3.2 Luong du lieu khach san
1. Du lieu goc nam o `data.js` (`hotels`).
2. Trang Home/Hotels goi `filterHotels(...)` trong `hotelQuery.js`.
3. Ket qua tiep tuc duoc goi `sortHotels(...)`.
4. Cuoi cung moi `slice(...)` theo so dong hien thi (`visibleRows`).

Nho thu tu nay:
`raw data -> filter -> sort -> paginate`

Neu dao thu tu, ket qua UI se sai va kho debug.

### 3.3 Luong destination o Home
1. User click card destination.
2. `destination` state duoc cap nhat.
3. `matchesDestination(...)` so khop an toan theo alias.
4. Danh sach duoc loc dung ca truong hop:
   - `TP.HCM`
   - `TP. Ho Chi Minh`
   - `Sai Gon`

## 4) Giai thich cac file quan trong

### `src/utils/hotelQuery.js`
- Chua bo filter/sort dung chung cho Home va Hotels.
- Co `HOTEL_FILTERS`, `HOTEL_SORT_OPTIONS`, `HOTEL_SORT_DEFAULT`.
- Co `matchesDestination(...)` de xu ly mismatch chuoi dia diem.

### `src/utils/hotelPricing.js`
- Chua cong thuc giam gia dung chung:
  - `getDiscountRate(...)`
  - `getDiscountPercent(...)`
- Ly do tach file: tranh lap cong thuc o nhieu noi.

### `src/pages/HomePage.jsx`
- Co day du luong filter + sort + load more.
- Co `useMemo` de tranh tinh lai vo ich.
- Co reset `visibleRows` khi doi filter/sort/destination de UX nhat quan.

### `src/hooks/useResponsiveGridColumns.js`
- Theo doi `window.innerWidth` de quyet dinh so cot.
- Trang Home/Hotels su dung chung, khong hard-code trong tung trang.

### `src/styles/*`
- `tokens.css`: bien mau, reset, font.
- `layout.css`: header, hero, section, destinations, footer.
- `components.css`: card, button, form, filter, sort.
- `pages.css`: style rieng cho About/Contact/Login va utility page-level.

## 5) Vi sao tach CSS nhu vay?
Truoc do style don vao mot file lon, de gay:
- Kho tim class.
- Kho biet style nao la global, style nao la page-specific.
- De sua nham va tao bug side-effect.

Sau khi tach:
- Nhin ten file la biet khu vuc style.
- Team de chia viec hon.
- De thay doi giao dien theo tung tang.

## 6) Cach chay du an

```bash
npm install
npm run dev
```

## 7) Goi y hoc sau khi doc source
1. Thu log ra `filteredHotels`, `sortedHotels`, `visibleHotels` de thay ro pipeline.
2. Thu doi `HOTEL_FILTER_DEFAULTS` de xem anh huong UI.
3. Thu them 1 sort moi trong `HOTEL_SORT_OPTIONS` + `sortHotels`.
4. Thu doi breakpoints trong `useResponsiveGridColumns`.

## 8) Luu y
- Day la du an front-end demo, chua co backend that.
- Du lieu trong `data.js` la du lieu gia lap de test UI/logic.
