// ==UserScript==
// @name         知乎标题关键词过滤器
// @version      1.0
// @author       jarvis
// @description  根据关键词屏蔽b站首页或视频页的封面及标题
// @match        *://*.zhihu.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    // 主页插入<li>元素
    var liElement = document.createElement('a');
    liElement.className = 'TopstoryTabs-link Topstory-tabsLink';
    liElement.innerHTML = '<span>设置屏蔽词</span>';
    liElement.style.marginLeft = '20px';

    //找到插入按钮的位置
    var leftEntry = document.querySelector('.TopstoryTabs.Topstory-tabs');
    // 如果.left-entry元素存在，则在其内部插入<li>元素
    leftEntry.appendChild(liElement);


    // 记录屏蔽词
    let pbc = []
    //显示屏蔽词的区域
    var pbcdiv = document.createElement('div');


    // 添加点击事件处理程序
    liElement.addEventListener('click', function() {
        // 创建遮罩层
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 1010; overflow: hidden;';

        // 创建弹窗
        var popup = document.createElement('div');
        popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; z-index: 1011; border-radius: 20px; width: 800px; height: 500px; overflow-y: auto;';

        // 创建标题
        var title = document.createElement('h1');
        title.style.cssText = 'margin-bottom: 20px; font-size: 24px; font-weight: bold;'; // 这里设置和<h1>标签一样的样式

        title.textContent = '设置屏蔽词';
        var spansc = document.createElement('span');
        spansc.style.cssText = 'float:right;cursor: pointer;margin-top:-10px'
        spansc.textContent = '✖';
        //按钮事件
        spansc.addEventListener('click', function() {
            // 移除弹窗和遮罩      // 恢复页面滚动
            document.body.removeChild(overlay);
            document.body.removeChild(popup);
            document.body.style.overflow = 'auto';
        });
        title.appendChild(spansc);



        // 顶部容纳输入框和记录按钮
        var headerdiv = document.createElement('div');
        headerdiv.style.cssText = 'width: 100%; height: 50px;';


        // 创建输入框
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '输入屏蔽词';
        input.style.cssText = 'width: 500px;  padding: 10px; border: 1px solid #ccc; border-radius: 5px; outline: none; transition: border-color 0.3s ease-in-out;';

        // 去除焦点时还原边框颜色
        input.addEventListener('blur', function() {
            input.style.borderColor = '#ccc';
        });

        // 添加输入框的聚焦事件，用于改变边框颜色
        input.addEventListener('focus', function() {
            input.style.borderColor = '#fb7299'; // 聚焦时的边框颜色
        });

        // 输入框回车添加
        input.addEventListener('change', function() {
            adblocords()
        });


        // 创建记录按钮
        var recordButton = document.createElement('button');
        recordButton.textContent = '记录';
        // 设置按钮样式
        recordButton.style.cssText = 'height: 37px; width: 100px; margin-left: 20px; margin-top: 10px; background-color: #fb7299; color: white; border: none; border-radius: 5px;';
        // 点击按钮创建
        recordButton.addEventListener('click', function() {
            adblocords()
        });

        // 添加到页面
        popup.appendChild(title);
        headerdiv.appendChild(input);
        headerdiv.appendChild(recordButton);
        popup.appendChild(headerdiv);



        //添加显示已经记录的屏蔽词
        var showaskedords = document.createElement('p');
        showaskedords.style.cssText = 'margin: 20px 0; font-size: 20px;';
        showaskedords.textContent = '已设置的屏蔽词';

        var showaskedordsspan = document.createElement('span');
        showaskedordsspan.style.cssText = 'margin: 0 0 0  20px; font-size: 14px;color:#ff8787';
        showaskedordsspan.textContent = '点击可删除';
        showaskedords.appendChild(showaskedordsspan);
        popup.appendChild(showaskedords);


        // 将显示屏蔽词的区域添加到页面
        pbcdiv.style.cssText = 'width: 100%; height: 220px; overflow: auto;';
        popup.appendChild(pbcdiv);


        // 创建底部  确认与关闭按钮  确认立即执行，关闭等待页面变化执行
        var bottomDiv= document.createElement('div');
        var closeButton = document.createElement('button');
        // 按钮展示文字
        closeButton.textContent = '关闭';
        // 底部div样式
        bottomDiv.style.cssText = 'width: 100%; height: 60px; text-align: right;';
        // 设置关闭按钮样式
        closeButton.style.cssText = 'height: 37px; width: 100px; margin-left: 20px; margin-top: 10px; background-color: #909399; color: white; border: none; border-radius: 5px;';
        //按钮事件
        closeButton.addEventListener('click', function() {
            // 移除弹窗和遮罩      // 恢复页面滚动
            document.body.removeChild(overlay);
            document.body.removeChild(popup);
            document.body.style.overflow = 'auto';
        });

        // 先添加到底部div
        bottomDiv.appendChild(closeButton)

        //将底部div添加入弹窗
        popup.appendChild(bottomDiv);

        // 添加遮罩和弹窗到页面
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        // 禁止页面滚动
        document.body.style.overflow = 'hidden';


        // 添加 屏蔽词到本地
        function adblocords(){
            var blockKeyword = input.value;
            // 处理用户输入的关键词，可以将其保存在本地存储或发送给服务器等
            if(blockKeyword.trim()== '')return false
            // 简易生成伪随机数
            let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            pbc.push({name:blockKeyword,guid:guid})
            saveToLocalStorage('pbc',pbc)
            getFromLocalStorage('pbc')
            input.value = ''
        }
    });


    // 查看本地缓存数据
    function getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            if (data !== null) {
                pbc = JSON.parse(data);
                // 清空节点内容
                while (pbcdiv.firstChild) {
                    pbcdiv.removeChild(pbcdiv.firstChild);
                }
                for(var index = 0; index < pbc.length; index++){
                    console.log(pbc[index].name)
                    var spanElement = document.createElement('span'); // 创建<span>元素
                    // 添加样式
                    spanElement.style.cssText = 'display: inline-block; line-height: 37px; text-align: left; border: 1px solid #ccc; border-radius: 5px; margin: 5px; padding: 0 10px; cursor: pointer;';
                    spanElement.textContent = pbc[index].name; // 设置<span>元素的文本内容

                    // 添加点击事件并传递参数
                    spanElement.addEventListener('click', function(event) {
                        var clickedName = event.target.textContent; // 获取被点击的span元素的文本内容
                        var clickedData = pbc.find(item => item.name === clickedName); // 查找匹配的数据

                        // 在这里可以使用clickedData或任何其他参数执行您的操作
                        console.log('您点击了：', clickedName);
                        console.log('对应的数据：', clickedData);
                        // 从pbc中删除符合 clickedData.guid 的数据
                        pbc = pbc.filter(item => item.guid !== clickedData.guid);

                        // 更新界面，重新渲染节点，可以重新调用 getFromLocalStorage 或其他方式
                        // 清空节点内容
                        while (pbcdiv.firstChild) {
                            pbcdiv.removeChild(pbcdiv.firstChild);
                        }
                        // 重新渲染
                        saveToLocalStorage('pbc',pbc)
                        getFromLocalStorage('pbc'); // 用您实际的键替换 'your-key'
                    });

                    pbcdiv.appendChild(spanElement); // 将<span>元素添加到pbcdiv中
                }
                return JSON.parse(data);
            }
            return null; // 如果键不存在，返回null
        } catch (error) {
            console.error('从本地缓存获取数据时出错:', error);
            return null;
        }
    }

    // 存储数据到本地缓存
    function saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log('数据已成功保存到本地缓存');
        } catch (error) {
            console.error('保存数据到本地缓存时出错:', error);
        }
    }


    function getFeedCardNodes() {
        // 使用 document.querySelectorAll 选择所有具有类名 .feed-card 的节点
        var feedCardNodes = document.querySelectorAll('.Card.TopstoryItem.TopstoryItem-isRecommend');

        // 将匹配的节点转换为数组，以便进行进一步操作
        var feedCardArray = Array.from(feedCardNodes);

        // 返回包含所有匹配节点的数组
        console.log('匹配的 .feed-card 节点数量:', feedCardArray);

        // 用来存储 class 名为 bili-video-card__info--tit 的内容
        var titles = [];
        // 用来存储包含屏蔽词的节点
        var filteredNodes = [];


        // 遍历每个 .feed-card 元素，获取其中 class 名为 bili-video-card__info--tit 的内容
        feedCardArray.forEach(function(feedCard) {
            // 在这里检查标题是否包含屏蔽词
            if (containsBlockedWord(feedCard.innerText)) {
                filteredNodes.push(feedCard);
            }
        });

        // 遍历包含屏蔽词的节点数组，并将它们隐藏
        filteredNodes.forEach(function(node) {
            node.style.display = 'none';
            //  node.style.background = 'red';
        });

        return feedCardArray;
    }


    // 检查标题是否包含屏蔽词的函数
    function containsBlockedWord(title) {
        // 假设 pbc 是包含屏蔽词的数据，例如：pbc = [{name: '屏蔽词1'}, {name: '屏蔽词2'}, ...]
        // 在这里检查标题是否包含屏蔽词
        for (var i = 0; i < pbc.length; i++) {
            var blockedWord = pbc[i].name;
            if (title.includes(blockedWord)) {
                return true; // 标题包含屏蔽词
            }
        }
        return false; // 标题不包含屏蔽词
    }

    // 创建一个 MutationObserver 实例，配置要观察的变化类型
    var observer = new MutationObserver(function(mutationsList, observer) {
        getFeedCardNodes()
    });
    // 启动观察器并传入要观察的 DOM 元素和配置
    observer.observe(document.body, { childList: true, subtree: true });
    // 开始执行
    getFromLocalStorage('pbc')
})();