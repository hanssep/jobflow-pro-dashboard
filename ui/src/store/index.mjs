/* eslint-disable import/order */
import { createStore } from 'vuex'

import ui from './ui.mjs'
import data from './data.mjs'
import setup from './setup.mjs'
import wysiwyg from './wysiwyg.mjs'
import designer from './designer.mjs'
import widgetTypes from './widgetTypes.mjs'

export default createStore({
    modules: {
        ui,
        data,
        setup,
        wysiwyg,
        designer,
        widgetTypes
    },
    plugins: []
})
