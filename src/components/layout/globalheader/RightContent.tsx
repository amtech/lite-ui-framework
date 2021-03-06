import React, { Component } from 'react';
import HeaderSearch from '@/components/layout/headersearch';
import styles from './index.less';
import Notification from './notification';
import Avatar from './AvatarDropdown';
import TaskBar from './Taskbar';
import { connect } from 'dva';
import router from 'umi/router'
import Link from 'umi/link'
import { Icon as GantIcon, Header } from 'gantd'
import { Icon, Tooltip, Popover, Tag, Menu, Dropdown } from 'antd'
import UIConfig from './UIConfig'
import { setLocale, getLocale } from 'umi/locale'
import { getUserIdentity, getCookie, setCookie, delCookie } from '@/utils/utils'

const { EXAMPLE } = process.env




const shortcutList = () => {
  return <div style={{ margin: '-10px' }}><ul className={styles.shortcutList} >
    <Header title={"Ctrl" + tr("类")} type="num" num='1' />
    <li> <Tag>Ctrl+B</Tag> {tr("主菜单的收缩")}</li>
    <Header title={"Shift" + tr("类")} type="num" num='2' />
    <li> <Tag>Shift+F</Tag> {tr("满屏显示")}</li>
    <Header title={"Alt" + tr("类")} type="num" num='3' />
    <li><Tag>Alt+H</Tag> {tr("回到首页")}</li>
    <li><Tag>Alt +↑</Tag>{tr("回到顶部")}</li>
    <Header title={"Esc" + tr("类")} type="num" num='4' />
    <li><Tag>Esc</Tag>{tr("关闭模态窗口")}</li>
  </ul>
  </div>
}


class GlobalHeaderRight extends Component {
  state = {
    UIConfigVisible: false
  }
  onMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'userinfo') {
      router.push('sysmgmt/account/personal');
      return;
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  };

  closeUIConfig = () => {
    this.setState({
      UIConfigVisible: false
    })
  }
  showUIConfig = (e) => {
    e.preventDefault();
    this.setState({
      UIConfigVisible: true
    })
  }

  launchFullScreen = () => {
    let element = document.documentElement;
    if (this.state.fullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        // IE11
        element.msRequestFullscreen();
      }
    }
    this.setState({
      fullscreen: !this.state.fullscreen
    })
  }
  componentDidUpdate() {
    this.changeTaskBarWidth()
    window.addEventListener('resize', this.changeTaskBarWidth) //监听窗口大小改变
    return function cleanup() {
      window.removeEventListener('resize', this.changeTaskBarWidth);
    };
  }

  changeTaskBarWidth = () => {
    const { settings } = this.props;
    const { MAIN_CONFIG: { showTaskBar } } = settings;
    const rightHeaderId = document.getElementById('rightHeaderId');
    const taskbarbox = document.getElementById('taskbarbox');
    if (showTaskBar && rightHeaderId) {
      const rightwidth = rightHeaderId.offsetWidth;
      const taskbarboxwidth = `calc(100% - ${rightwidth}px - 42px)`
      taskbarbox.style.width = taskbarboxwidth
    }
  };


  changeLocale = (item) => {
    const { key } = item;
    const userIdentity = getUserIdentity()
    const newUserIdentity = {
      ...userIdentity,
      userLanguage: key, // 根据国际化替换
    }
    setCookie('userIdentity', JSON.stringify(newUserIdentity),7*24*3600,'/')
    switch (key) {
      case 'zh-CN':
        setLocale('zh-CN')
        break;
      case 'en':
        setLocale('en-US')
        break;
      default:
        break;
    }
  }

  render() {
    const { theme, layout, location, menuData, history, settings, dispatch, userId, username, config } = this.props;
    const { MAIN_CONFIG } = settings;
    const { UIConfigVisible, fullscreen } = this.state
    const {
      showTaskBar = false,
      
    } = MAIN_CONFIG;

    const { COMMON_CONFIG: {
      showMsgBtn,
      showUIConfig,
      showChangeLanguageMenu,
      showGlobalSearch = false,
      globalSearchPath = '',
      globalHeaderExtra
    } } = config

    let className = styles.right;
    if (theme === 'dark' && layout === 'topmenu') {
      className = `${styles.right}  ${styles.dark}`;
    }
    const UIConfigProps = {
      settings, dispatch, UIConfigVisible, closeUIConfig: this.closeUIConfig
    }
    const globalSearch = (value) => {
      router.push(`${globalSearchPath}?keywords=${value}`);
    }
    return (
      <>
        <div className={className} id='rightHeaderId'>
          {globalHeaderExtra && globalHeaderExtra}

          <Popover placement="bottom" title={tr('快捷键')} content={shortcutList()} trigger="click" width={300}>
            <span
              className={styles.action}
            >
              <GantIcon type="icon-keyboard" className="paddingh5" />
            </span>
          </Popover>

          {showUIConfig && <Tooltip title={tr('界面设置')}>
            <span href="#" className={styles.action} onClick={this.showUIConfig}>
              <Icon type="control" />
            </span>
          </Tooltip>}

          <Dropdown
            overlay={
              <Menu className={styles.menu} selectedKeys={[]} >
                <Menu.SubMenu title={<><Icon type="eye" />{tr('浏览历史')}</>}>
                  {
                    history.length ?
                      history.map(location => (
                        <Menu.Item key={location.key || location.pathname}>
                          <Link to={location}>{location.name}</Link>
                        </Menu.Item>
                      )) :
                      <Menu.Item>{tr('暂无浏览历史')}</Menu.Item>
                  }
                </Menu.SubMenu>

                {showChangeLanguageMenu && <Menu.SubMenu onClick={this.changeLocale} title={<><Icon type="global" />{tr('切换语言')}</>}>
                  <Menu.Item key="zh-CN">
                    {tr('简体中文')}
                  </Menu.Item>
                  <Menu.Item key="en">
                    {tr('英文')}
                  </Menu.Item>
                </Menu.SubMenu>}

                <Menu.Item key="1" onClick={this.launchFullScreen}>
                  {!fullscreen && <>
                    <Icon type="fullscreen" />
                    {tr('进入全屏')}<Tag style={{ float: 'right' }}>F11</Tag>
                  </>}
                  {fullscreen && <>
                    <Icon type="fullscreen-exit" />
                    {tr('退出全屏')}<Tag style={{ float: 'right' }}>F11</Tag>
                  </>}
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
            placement="bottomCenter"
          >
            <a href="#" onClick={e => e.preventDefault()} className={styles.action} >
              <Icon type="ellipsis" />
            </a>
          </Dropdown>
          <Avatar />
        </div>

        <UIConfig {...UIConfigProps} />

        {showTaskBar ?
          <div className={styles.taskbarbox} id='taskbarbox'>
            <TaskBar location={location} menuData={menuData} history={history} dispatch={dispatch} userId={userId} username={username} />
          </div>
          : ''
        }
      </>
    );
  }
}

export default connect(({ settings, menu, user, config }) => ({
  ...menu,
  config: config,
  theme: settings.MAIN_CONFIG.navTheme,
  layout: settings.MAIN_CONFIG.layout,
  userId: user.currentUser.id,
}))(GlobalHeaderRight);
