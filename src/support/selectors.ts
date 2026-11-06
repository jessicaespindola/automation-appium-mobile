function escapeUi(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function byText(text: string): string {
  return `android=new UiSelector().text("${escapeUi(text)}")`;
}

export function byTextContains(text: string): string {
  return `android=new UiSelector().textContains("${escapeUi(text)}")`;
}

export function listView(): string {
  return 'android=new UiSelector().className("android.widget.ListView")';
}

export function listItem(text: string): string {
  return `android=new UiSelector().className("android.widget.ListView").childSelector(new UiSelector().text("${escapeUi(text)}"))`;
}

export function dropdownValue(): string {
  return 'android=new UiSelector().description("Dropdown").childSelector(new UiSelector().className("android.widget.EditText"))';
}
