import { checklist } from './src/index'

tinymce.PluginManager.add('checklist', checklist)

tinymce.init({
  selector: '#editor',
  menubar: false,
  statusbar: false,
  toolbar: 'bold italic underline bullist numlist checklist link image code',
  plugins: 'checklist code link lists advlist image',
})
