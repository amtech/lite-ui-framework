import React, { useCallback, useMemo } from 'react'
import { Checkbox, Icon, Row, Radio, notification, Tooltip } from 'antd'
import { SortableContainer, SortableElement, SortableHandle, SortEndHandler } from 'react-sortable-hoc'
import arrayMove from 'array-move'
import { Icon as GantIcon } from 'gantd'
import styles from './index.less'

interface RecordProps {
  dataIndex: string,
  title: string,
  checked: boolean,
  lock?: boolean,
  clickable?: boolean,
  fixed?: 'left' | 'right',
  align?: 'left' | 'right' | 'center'
}

interface SortableProps {
  dataSource: RecordProps[],
  onChange: (records:RecordProps[]) => void,
}

function Sortable(props: SortableProps) {
  const {
    dataSource,
    onChange
  } = props;

  if(!dataSource || !dataSource.length) return null;

  const fakeDataSource = useMemo(() => {
    const sliceDataSource = (start: number, end?: number) => dataSource.slice(start, end).map((v, i) => ({ ...v, realIndex: start + i }));
    let locks = dataSource.map((v) => {
      v.clickable = false;
      v.fixed = undefined;
      return Boolean(v.lock)
    });

    let firstIndex = locks.indexOf(false)
    let lastIndex = locks.lastIndexOf(false)
    if (!~firstIndex) {
      dataSource[0].clickable = true;
      dataSource[dataSource.length - 1].clickable = true;
      return [
        [],
        sliceDataSource(0),
        []
      ]
    }
    if (~firstIndex) {
      dataSource[firstIndex - 1] && (dataSource[firstIndex - 1].clickable = true)
      dataSource[firstIndex].clickable = true;

      for (let idx = 0; idx < firstIndex; idx++) {
        const item = dataSource[idx];
        item.fixed = 'left';
      }
    }
    if (~lastIndex) {
      dataSource[lastIndex].clickable = true;
      dataSource[lastIndex + 1] && (dataSource[lastIndex + 1].clickable = true)

      for (let last = dataSource.length - 1, idx = last; idx > lastIndex; idx--) {
        const item = dataSource[idx];
        item.fixed = 'right';
      }
    }

    let prevDataSource = sliceDataSource(0, firstIndex);
    let unlocakDataSource = sliceDataSource(firstIndex, lastIndex + 1);
    let afterDataSource = sliceDataSource(lastIndex + 1);

    return [
      prevDataSource,
      unlocakDataSource,
      afterDataSource
    ]
  }, [dataSource])

  const handlerLock = useCallback((index) => {
    if (dataSource[index].clickable) {
      dataSource[index].lock = true;
      onChange(dataSource)
    } else {
      notification.info({
        message: tr('只能从两侧开始锁定')
      })
    }
  }, [dataSource])

  const handlerUnlock = useCallback((index) => {
    if (dataSource[index].clickable) {
      dataSource[index].lock = false;
      onChange(dataSource)
    } else {
      notification.info({
        message: tr('只能从靠近未锁定的列开始解锁')
      })
    }
  }, [dataSource])

  const handlerChangeAlign = useCallback((index, event) => {
    dataSource[index].align = event.target.value;
    onChange(dataSource)
  },[dataSource])
  

  const handlerFieldVisible = useCallback((index, event) => {
    dataSource[index].checked = event.target.checked;
    onChange(dataSource)
  }, [dataSource])

  const DragHandler = SortableHandle(() => <GantIcon className={styles.dragHandler} type="icon-hanbaocaidanzhedie" />);

  const SortableItem = SortableElement(
    ({ record: { title, checked, align }, realIndex, lock }: any) => (
      <Row type="flex" align="middle" justify="space-between" className={styles.tableRow}>
        <div style={{flexGrow:0}}>
          <Checkbox checked={checked} onChange={handlerFieldVisible.bind(null, realIndex)} />
        </div>
        <div style={{flexGrow:1,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{flex:1}}>{title}</span>
          <Radio.Group style={{flex:1}} value={align} onChange={handlerChangeAlign.bind(null, realIndex)} size="small" buttonStyle="solid">
            <Radio.Button value="left">{tr('居左')}</Radio.Button>
            <Radio.Button value="center">{tr('居中')}</Radio.Button>
            <Radio.Button value="right">{tr('居右')}</Radio.Button>
          </Radio.Group>
        </div>
        <div style={{flexGrow:0,display:'flex',width:56,flexDirection:'row-reverse'}}>
            {!lock&&<DragHandler />}
            {
              lock?(
                <Tooltip style={{flex:0}} placement="top" title={tr('设为普通列')}>
                  <Icon type="lock" onClick={() => handlerUnlock(realIndex)} className={styles.disabledIcon} />
                </Tooltip>
              ):(
                <Tooltip placement="top" title={tr('设为固定列')}>
                  <Icon type="unlock" onClick={() => handlerLock(realIndex)} className={styles.disabledIcon} />
                </Tooltip>
              )
            }
          </div>
      </Row>
    )
  );

  const SortableList = SortableContainer(() => {
    return <div className={styles.sortableList}>
      {fakeDataSource.map((collection, idx) => (
        <React.Fragment key={idx}>
          {
            collection.map((value: any, index: number) => (
              <SortableItem collection={idx} disabled={value.lock} lock={value.lock} index={index} key={value.dataIndex} realIndex={value.realIndex} record={value} />
            ))
          }
        </React.Fragment>
      ))}
    </div>;
  });

  // 选择
  
  const selectedRows = useMemo(() => dataSource.filter(record=>record.checked),[dataSource])
  const indeterminate = useMemo(() => !!selectedRows.length && selectedRows.length < dataSource.length,[selectedRows,dataSource])
  const checkedAll = useMemo(() => !!selectedRows.length && selectedRows.length === dataSource.length,[selectedRows,dataSource])
  
  const onCheckAllChange = useCallback((e) => {
    dataSource.forEach(record=>{
      record.checked = !!e.target.checked
    })
    onChange(dataSource)
  },[dataSource])
  
  const handlerSortEnd: SortEndHandler = useCallback(({ oldIndex, newIndex }) => {
    onChange(arrayMove(dataSource, oldIndex, newIndex))
  }, [dataSource])

  return (
    <div style={{paddingBottom:10}}>
      <Row type="flex" align="middle" justify="space-between" className={styles.tableHeader}>
        <div style={{flexGrow:0}}>
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkedAll}
          />
        </div>
        <div style={{flexGrow:1}}>
          {tr('全选')}（{`${selectedRows.length}/${dataSource.length}`}）
        </div>
        <div style={{flexGrow:1}}>
          {tr('对齐方式')}
        </div>
        <div style={{flexGrow:0,width:56}}></div>
      </Row>
      <div>
        <SortableList
          onSortEnd={handlerSortEnd}
          axis="y"
          helperClass={styles.sortableHelper}
          useDragHandle
        />
      </div>
    </div>
  )
}

export default Sortable;