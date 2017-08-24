import {
    SOCKET_RECONNECT,
    SOCKET_RESTORE_INFO,
    SOCKET_USER_CHANGE,
    SOCKET_MANAGER_CHANGE,
    SOCKET_MATE_CHANGE,
    SOCKET_GROUP_CHANGE,
    SOCKET_CHAT_CHANGE,
    SOCKET_NOTICE_CHANGE,
    SOCKET_SEARCH_USER_CHANGE,
    VIEW_SEARCH_USER_CHANGE,
    VIEW_STATE_CHANGE,
    SOCKET_STATE_CHANGE,
    VIEW_DRAFT_CHAGE,
    VIEW_LEFT_OPEN,
    VIEW_RIGHT_SWITCH,
    VIEW_CHAT_CHANGE,
    VIEW_CHAT_MSGKEY,
    VIEW_TOGGLE_HISTORY
} from './mutation-types';
import storage from './storage';
import util from '../util';
import events from '../events';

let messageMaxCount = 30;
let config = window.FangChat.config;

let formatNotSyncInfo = (id, view_name) => {
    let ret = {
        id: id,
        nickname: id
    };
    if (view_name) {
        ret.view_name = view_name;
    }
    return ret;
};

/**
 * @param {*} state : vuex state
 * @param {*} id ：用户 id
 * @param {*} view_name : 请求完成后返回的信息，添加到对应 view_name 列表中。没有view_name 参数时，只请求用户信息。
 */
let infoRequest = (state, id, view_name) => {
    let info = formatNotSyncInfo(id, view_name);
    if (view_name && view_name.split('_')[2] === 'group') {
        state.info_group = Object.assign({}, state.info_group, {
            [id]: info
        });
        events.trigger('store:request:group', info);
    } else {
        // 要先添加基本信息，因为 im 已经渲染， 否则找不到信息报错
        state.info_user = Object.assign({}, state.info_user, {
            [id]: info
        });
        // 这里要是一个新对象，否则 vuex 报错
        // 最好是一个 promise 执行完成后进行回调，就不需要更新两遍对象，刷新两遍视图。
        events.trigger('store:request:user', info);
    }
};

let addViewList = (state, view_name, id) => {
    let list = state[view_name];
    if (list.length) {
        let i = list.length;
        while (i--) {
            if (list[i] === id) {
                // list.splice(i, 1);
                return;
            }
        }
        state[view_name] = [id].concat(list);
    } else {
        state[view_name] = [id];
    }
    storage.coreSet(view_name, state[view_name]);
};

let addRecentNew = (state, id, count = 1) => {
    let recent_list = state.recent.list;
    if (recent_list[id]) {
        recent_list[id] += count;
    } else {
        recent_list[id] = count;
    }

    state.recent.list = Object.assign({}, recent_list);
    state.recent.notice += count;

    // 通讯录红点不要了
    // if (id.split(':')[0] === 'oa') {
    //     [].concat.apply([], [state.view_book_buddy, state.view_book_manager, state.view_book_mate]).every((v) => {
    //         if (v === id) {
    //             state.recent.book += count;
    //             return false;
    //         }
    //         return true;
    //     });
    // } else {
    //     state.view_book_group.every((v) => {
    //         if (v === id) {
    //             state.recent.book += count;
    //             return false;
    //         }
    //         return true;
    //     });
    // }
};

let diffRecentNew = (state) => {
    // 只有打开窗口才会减少条数
    if (!state.leftWindow) {
        console.log('not open left window');
        return;
    }
    let id = state.leftWindow.id,
        count = state.leftWindow.recent_new;

    let recent_list = state.recent.list;
    recent_list[id] = 0;
    state.recent.list = Object.assign({}, recent_list);
    state.recent.notice -= count;
    if (state.recent.notice < 0) {
        state.recent.notice = 0;
    }

    // 通讯录红点不要了
    // if (id.split(':')[0] === 'oa') {
    //     [].concat.apply([], [state.view_book_buddy, state.view_book_manager, state.view_book_mate]).every((v) => {
    //         if (v === id) {
    //             state.recent.book -= count;
    //             if (state.recent.book < 0) {
    //                 state.recent.book = 0;
    //             }
    //             return false;
    //         }
    //         return true;
    //     });
    // } else {
    //     state.view_book_group.every((v) => {
    //         if (v === id) {
    //             state.recent.book -= count;
    //             if (state.recent.book < 0) {
    //                 state.recent.book = 0;
    //             }
    //             return false;
    //         }
    //         return true;
    //     });
    // }
};

let addNoticeRecentNew = (state, id, count = 1) => {
    let recent_list = state.recent.list.notice;
    if (recent_list[id]) {
        recent_list[id] += count;
    } else {
        recent_list[id] = count;
    }

    state.recent.list.notice = Object.assign({}, recent_list);
    state.recent.notice += count;
};


let diffNoticeRecentNew = (state) => {
    let id = state.leftWindow.id,
        count = state.leftWindow.recent_new;

    let recent_list = state.recent.list.notice;
    recent_list[id] = 0;
    state.recent.list.notice = Object.assign({}, recent_list);
    state.recent.notice -= count;
    if (state.recent.notice < 0) {
        state.recent.notice = 0;
    }
};

export default {
    // [SOCKET_RECONNECT](state) {
    //     state.notice_lists = storage.coreGet('notice_lists') || [];
    //     state.message_lists = storage.coreGet('message_lists') || {};
    //     state.draft = storage.coreGet('draft') || {};
    // },
    [SOCKET_RESTORE_INFO](state, data) {
        state.info_group = data.info_group ;
        state.info_user = data.info_user ;
        state.view_notice = data.view_notice ;
        state.view_notice_single = data.view_notice_single ;
        state.view_notice_group = data.view_notice_group ;
        // 不能保存通讯录，有可能增加、也有可能减少，不好处理
        // state.view_book_group = data.view_book_group ;
        // state.view_book_buddy = data.view_book_buddy ;
        // state.view_book_manager = data.view_book_manager ;
        // state.view_book_mate = data.view_book_mate ;
        // state.view_book_follow = data.view_book_follow ;
        state.notice_lists = data.notice_lists ;
        state.message_lists = data.message_lists;
        state.draft = data.draft;
        data.resolve();
    },
    // 同步组信息
    [SOCKET_GROUP_CHANGE](state, data) {
        let info = state.info_group;
        let l = [],
            o = {};
        data.forEach(function (v) {
            let id = v.id;
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }
            l.push(id);

            if (v.view_name) {
                addViewList(state, v.view_name, id);
            }
        });
        if (l.length) {
            state.view_book_group = state.view_book_group.concat(l);
        }
        state.info_group = Object.assign({}, info, o);
        storage.coreSet('info_group', state.info_group);
    },
    // 同步用户信息
    [SOCKET_USER_CHANGE](state, data) {
        let info = state.info_user;
        let fl = [],
            bl = [],
            o = {};

        data.forEach(function (v) {
            let id = v.id;

            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }

            // 不将登录的信息添加到队列，因为要置顶；不是组中的未同步成员或初始同步
            if (id !== config.username && v.view_name !== 'only_request') {
                bl.push(id);

                if (v.follow) {
                    fl.push(id);
                }
            }

            // 不是组中的未同步成员
            if (v.view_name && v.view_name !== 'only_request') {
                addViewList(state, v.view_name, id);
            }

            // 搜索用户情况，signame 传过去了
            if (v.bySearch) {
                delete v.bySearch;
                state.leftWindow = Object.assign({}, state.leftWindow, v);
            }
        });
        if (bl.length) {
            state.view_book_buddy = state.view_book_buddy.concat(bl);
            // storage.coreSet('view_book_buddy', state.view_book_buddy);
            if (fl.length) {
                state.view_book_follow = state.view_book_follow.concat(fl);
                // storage.coreSet('view_book_follow', state.view_book_follow);
            }
        }
        state.info_user = Object.assign({}, info, o);
        storage.coreSet('info_user', state.info_user);
    },
    // 同步上下级信息
    [SOCKET_MANAGER_CHANGE](state, data) {
        let info = state.info_user;
        let l = [],
            o = {};
        data.forEach(function (v) {
            let id = v.id;
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }
            l.push(id);
        });
        if (l.length) {
            state.view_book_manager = state.view_book_manager.concat(l);
            // storage.coreSet('view_book_manager', state.view_book_manager);
        }
        state.info_user = Object.assign({}, info, o);
        storage.coreSet('info_user', state.info_user);
    },
    // 同步同事信息
    [SOCKET_MATE_CHANGE](state, data) {
        let info = state.info_user;
        let l = [],
            o = {};
        data.forEach(function (v) {
            let id = v.id;
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }
            l.push(id);
        });
        if (l.length) {
            state.view_book_mate = state.view_book_mate.concat(l);
            // storage.coreSet('view_book_mate', state.view_book_mate);
        }
        state.info_user = Object.assign({}, info, o);
        storage.coreSet('info_user', state.info_user);
    },
    [SOCKET_NOTICE_CHANGE](state, data) {
        let id = data.id;
        let info = state.info_user[id];
        if (!info) {
            // 通知发送人 基本信息添加
            infoRequest(state, id, 'view_notice');
            // 通知发送人 id 列表更新
            // state.view_notice = state.view_notice.concat([id]);
        } else {
            addViewList(state, 'view_notice', id);
        }
        let leftWindow = state.leftWindow;
        // 接收到新消息，没有打开左侧聊天窗口，或者当前窗口不是消息发送人，或者最小化状态，记录新条数
        if (state.app === 'min' || !leftWindow.id || leftWindow.id !== id || leftWindow.signame !== 'im_notice') {
            // 如果没有打开窗口，且没有同步消息时间
            addNoticeRecentNew(state, id);
        }

        let lists = state.notice_lists;
        if (!lists[id]) {
            lists[id] = [];
        }
        let list = lists[id].concat([data]);
        state.notice_lists = Object.assign({}, lists, {
            [id]: list
        });
        storage.coreSet('notice_lists', state.notice_lists);
    },
    [SOCKET_SEARCH_USER_CHANGE](state, data) {
        if (util.isArray(data)) {
            let result = state.search.result;
            if (data.length) {
                state.search.result = result.concat(data);
                if (data.length < 20) {
                    state.search.info = 'nomore';
                }
            } else if (result.length) {
                state.search.info = 'nomore';
            } else {
                state.search.info = 'none';
            }
        } else {
            state.search.info = 'fail';
        }
        state.search.requesting = false;
    },
    [VIEW_SEARCH_USER_CHANGE](state, data) {
        state.search.keyword = data.keyword || state.search.keyword;
        state.search.result = data.result || state.search.result;
        state.search.info = data.info || state.search.info;
        state.search.keyword = data.keyword || state.search.keyword;
        state.search.requesting = data.requesting || state.search.requesting;
    },
    [VIEW_STATE_CHANGE](state, params) {
        let key = params[0],
            value = params[1];
        state[key] = value;
        // 聊天窗口关闭
        if (key === 'left' && value === 'close') {
            state.leftWindow = {};
        }

        // 删除未读消息条数标记，使用记录布点
        if (key === 'app') {
            if (value === 'max') {
                events.trigger('store:record:point');
                if (state.leftWindow.id) {
                    if (state.leftWindow.signame === 'im_notice') {
                        diffNoticeRecentNew(state);
                    } else {
                        diffRecentNew(state);
                    }
                }
            }
            if (value === 'closed') {
                util.setCookie('fang_oaim_closed', 'closed');
            }
        }
    },
    [SOCKET_STATE_CHANGE](state, data) {
        state.socket_state = data;
    },
    [VIEW_CHAT_MSGKEY](state, data) {
        let lists = state.message_lists,
            // 不适用 leftWindow.id 因为有可能返回结果已经切换窗口了
            id = data.sendto;
        let list = lists[id];
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].messagekey === data.messagekey) {
                    if (data.remove) {
                        list.splice(i, 1);
                    } else {
                        list[i].messagestate = data.state;
                    }
                    state.message_lists = Object.assign({}, lists, {
                        [id]: list
                    });
                    storage.coreSet('message_lists', state.message_lists);
                    break;
                }
            }
        }
        // 窗口打开 send 、 receive 更新同步时间，和服务器时间大概有 2s 的延迟。所以返回之后再记录同步时间。
        // let time = new Date().getTime();
        // storage.setSynctime(id, 2 * 1000 + time);
    },
    [VIEW_TOGGLE_HISTORY](state, opts) {
        if (opts.state) {
            state.historyContainer.loadState = opts.state;
        }

        if (opts.open === 1) {
            state.historyContainer.open = true;
        }

        if (opts.open === 0) {
            state.historyContainer.open = false;
            state.historyContainer.list = [];
            state.historyContainer.nomore = false;
        }
    },
    // 目前用于搜索结果点击进行聊天，跳转到单聊列表
    [VIEW_RIGHT_SWITCH](state, opts) {
        let open = state.rightPanel.open;
        state.rightPanel.open = Object.assign({}, open, {
            [opts.signame]: opts.open
        });
    },
    [VIEW_LEFT_OPEN](state, opts) {
        // 先进行草稿保存
        let draft = state.draft,
            id_old = state.leftWindow.id;
        if (opts.draft !== draft[id_old]) {
            if (!opts.draft) {
                delete state.draft[id_old];
            } else {
                state.draft = Object.assign({}, draft, {
                    [id_old]: opts.draft
                });
            }
        }
        storage.coreSet('draft', state.draft);

        let id_new = opts.id;
        // 获得点击的 signame
        let isGroup = id_new.split(':')[0] !== 'oa';
        let leftWindow = {
            // 聊天对象唯一标识，http 查询信息标识, 接口 resourceid 。
            id: id_new,
            // 添加 oa 前缀 id, socket 查询 id, oa:12345
            // username: opts.username,
            // 昵称、姓名 聊天窗口显示文字
            nickname: opts.nickname || id_new,
            // 窗口类型：好友、群聊、关注。用于判断当前打开窗口。
            // signame: signame[2] === 'group' ? 'im_notice_group' : 'im_notice_single',
            signame: opts.signame,
            // 头像
            avatar: opts.avatar || '',
            email: opts.email || '',
            recent_new: opts.recent_new || 0
        };

        if (isGroup) {
            // 群人员数量
            leftWindow.number = opts.number ? opts.number : '';
            // addViewList(state, 'view_notice_group', id);
        } else {
            let department = opts.department;
            if (!department || department === 'null/null') {
                department = '';
            }
            leftWindow.department = department;
            // if (opts.signame !== 'view_notice') {
                // addViewList(state, 'view_notice_single', id);
            // }
        }

        state.leftWindow = leftWindow;

        // 先打开窗口，再触发清除文字
        // events.trigger('view:clear:chatarea', draft[id_new] || '');

        // 打开窗口有同步时间，更新同步时间
        // 只有新的条数才拉取历史记录，就是为了得到未读消息。
        if (opts.recent_new) {
            if (opts.signame === 'im_notice') {
                diffNoticeRecentNew(state);
            } else {
                diffRecentNew(state);
                // 非通知时，有新消息，且没有发送或接收过消息，拉取信息！！！没有限制条数
                events.trigger('store:request:history', {
                    id: id_new,
                    exec: 'sync_recent'
                });
            }
            // storage.setSynctime(opts.id);
            return;
        }

        // 添加提示信息
        let welcome = state.welcome,
            message_list = state.message_lists[id_new];
        if (!welcome.hasOwnProperty(id_new)) {
            if (message_list) {
                state.welcome[id_new] = message_list.length - 1;
            } else {
                state.welcome[id_new] = -1;
            }
        } else {
            state.welcome[id_new] = -100;
        }
    },
    [SOCKET_CHAT_CHANGE](state, data) {
        let lists = state.message_lists;

        let id = data.id;
        let history = data.history;
        let isGroup = id.split(':')[0] !== 'oa';
        // 多条，历史记录请求，点击窗口已经判断是否有 info, 应该都是一个人的，打开窗口的
        if (history) {
            state.historyContainer.loadState = '';
            state.historyContainer.nomore = !history.length;
            state.welcome = Object.assign({}, state.welcome, {
                [id]: -100
            });

            let list = [];
            // let recent_new = 0;
            history.forEach((chat) => {
                list.push(chat);
                // if (data.exec === 'more_recent' && i < more_length) {
                //     list.push(chat);
                //     return;
                // }

                // if (data.exec === 'more_history') {
                //     list.push(chat);
                //     return;
                // }

                if (isGroup) {
                    if (!state.info_user[chat.from]) {
                        infoRequest(state, chat.from, 'only_request');
                    }
                }

                // if (data.exec === 'sync_recent') {
                //     let synctime = storage.getSynctime(id);
                //     // 只将未读消息更新

                //     if (chat.time >= synctime) {
                //         recent_new++;
                //     }
                // }
            });

            if (data.exec === 'more_history') {
                let history_list = state.historyContainer.list;
                if (history_list.length) {
                    state.historyContainer.list = history_list.concat(list);
                } else {
                    state.historyContainer.list = list;
                }
                return;
            }

            // 去掉了同步未读消息，所以 recent_new 永远是 0
            // if (recent_new) {
            //     if (state.leftWindow.id === id) {
            //         storage.setSynctime(id);
            //     } else {
            //         addRecentNew(state, id, recent_new);
            //         if (id.split(':')[0] === 'oa') {
            //             addViewList(state, 'view_notice_single', id);
            //         } else {
            //             addViewList(state, 'view_notice_group', id);
            //         }
            //     }
            // }

            // 有数据再更新 view 数据
            if (list.length) {
                // 初始化消息数组
                if (!lists[id]) {
                    lists[id] = [];
                }
                // 同步的时候，直接赋值
                if (data.exec !== 'sync_recent') {
                    list = lists[id].concat(list);
                }
                state.message_lists = Object.assign({}, lists, {
                    [id]: list
                });
                storage.coreSet('message_lists', state.message_lists);
            }
        } else {
            let leftWindow = state.leftWindow;

            // 接收到新消息，没有打开左侧聊天窗口，或者当前窗口不是消息发送人，或者最小化状态，记录新条数
            if (state.app === 'min' || !leftWindow.id || leftWindow.id !== id || leftWindow.signame === 'im_notice') {
                // 如果没有打开窗口，且没有同步消息时间
                // if (!storage.getSynctime(data.id)) {
                //     storage.setSynctime(data.id, data.time);
                // }
                // 收到自己发的消息，不记录新消息
                if (data.from !== config.username) {
                    addRecentNew(state, id);
                }
            }
        }
    },
    [VIEW_DRAFT_CHAGE](state, id) {
        delete state.draft[id];
        storage.coreSet('draft', state.draft);
    },
    [VIEW_CHAT_CHANGE](state, data) {
        let id = data.id;
        let isGroup = id.split(':')[0] !== 'oa';
        // 只有当前窗口时才更新列表，否则只在 SOCKET_CHAT_CHANGE 中更新新消息条数、send 的情况
        if (state.leftWindow.id === id) {
            // storage.setSynctime(data.id, data.time);
            if (state.historyContainer.open) {
                state.historyContainer.state = '';
                state.historyContainer.open = false;
            }
        }

        if (state.draft[id] && data.source === 'send') {
            delete state.draft[id];
            storage.coreSet('draft', state.draft);
        }

        // 这里只添加信息，不添加具体信息 在 view messageList 中添加具体消息
        if (isGroup) {
            // 收到消息的 group 信息不存在
            if (!state.info_group[id]) {
                infoRequest(state, id, 'view_notice_group');
            } else {
                addViewList(state, 'view_notice_group', id);
            }
            // 如果收到消息的群成员没有信息，请求一次
            if (!state.info_user[data.from]) {
                infoRequest(state, data.from, 'only_request');
            }
        } else {
            // 收到消息的 user 信息不存在
            if (!state.info_user[id]) {
                infoRequest(state, id, 'view_notice_single');
            } else {
                addViewList(state, 'view_notice_single', id);
            }
        }

        let lists = state.message_lists;
        let list = lists[id];
        if (!list) {
            list = lists[id] = [];
        }

        if (list.length >= messageMaxCount) {
            list.pop();
            list.unshift(data);
            let welcome = state.welcome;
            if (welcome.hasOwnProperty(id)) {
                state.welcome = Object.assign({}, welcome, {
                    [id]: welcome[id] - 1
                });
            }
        } else {
            list.unshift(data);
        }
        state.message_lists = Object.assign({}, lists, {
            [id]: list
        });
        storage.coreSet('message_lists', state.message_lists);
    }
};
