'use strict';

const dom = {
    create({
        content = '',
        type = 'div',
        parent = false,
        classes = [],
        styles = {},
        attr = {}
    } = {}) {
        let newEl = document.createElement(type);
        if (content) newEl.innerHTML = content;
        if (classes.length) newEl.className = classes.join(' ');
        Object.entries(styles).forEach(style => newEl.style[style[0]] = style[1]);
        Object.entries(attr).forEach(el => newEl.setAttribute(...el));
        if (parent) parent.append(newEl);
        return newEl;
    },

    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return [...document.querySelectorAll(selector)];
    }
}

export default dom;