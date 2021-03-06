import React, { useState, useEffect, useCallback } from 'react'
import { Row, Col } from 'antd';
import styles from './index.less'
import ReactResizeDetector from 'react-resize-detector';
import moment from 'moment'
import { ConfigBar } from '@/widgets/utils'
import classnames from 'classnames'
import SnapShot from './snapshot.png'
const modelRegisterKey = ''

const Widget = (props: any) => {
	const {
		itemHeight, editMode, widgetKey, handleDeleteWidget
	} = props;

	const [layout, setLayout] = useState('h')
	const [fontSize, setfontSize] = useState('60px')
	const [degSeconds, setDegSeconds] = useState(0)
	const [degMinutes, setDegMinutes] = useState(0)
	const [degHours, setDegHours] = useState(0)

	const clockRun = useCallback(() => {
		var date = new Date(),
			seconds = date.getSeconds(),
			minutes = date.getMinutes(),
			hours = date.getHours();
		setDegSeconds(seconds * 360 / 60)
		setDegMinutes((minutes + seconds / 60) * 360 / 60)
		setDegHours((hours + minutes / 60 + seconds / 60 / 60) * 360 / 12)
	}, [])

	useEffect(() => {
		let run = setInterval(() => {
			clockRun()
		}, 1000)
		return function cleanup() {
			clearInterval(run)
		};
	}, [])

	const onResize = (w: number, h: number) => {
		let layoutTemp: string, fontSizeTemp: string;
		if (w < h) {
			layoutTemp = 'v'
			fontSizeTemp = h / 6 + 'px'
		} else {
			layoutTemp = 'h'
			fontSizeTemp = h / 3 + 'px'
		}
		setLayout(layoutTemp)
		setfontSize(fontSizeTemp)
	}

	return (
		<div
			className={classnames('full', styles.Widget)}
		>
			<ReactResizeDetector handleWidth handleHeight onResize={onResize} key={1}>
				<Row style={{ height: itemHeight }}>
					<Col span={layout == 'h' ? 8 : 24} className={styles.left} style={{ height: layout == 'h' ? '100%' : '50%' }}>
						<div className={styles.clock}>
							<div className={styles.c1}>
								<div className={styles.c2}>
									<div className={styles.pin}><div className={styles.clockInner}></div></div>
									<div id="hr" className={styles.hr} style={{ transform: `rotate(${degHours}deg)` }}></div>
									<div id="min" className={styles.min} style={{ transform: `rotate(${degMinutes}deg)` }}></div>
									<div id="sec" className={styles.sec} style={{ transform: `rotate(${degSeconds}deg)` }}></div>
								</div>
							</div>
						</div>
					</Col>
					<Col span={layout == 'h' ? 16 : 24} className={styles.right} style={{ height: layout == 'h' ? '100%' : '50%' }}>
						<div className={styles.time_num} style={{ fontSize }}>
							{moment().format('HH:mm')}
						</div>
						<div className={styles.calender}>
							<div className={styles.year}>{moment().format('YYYY年')}</div>
							<div className={styles.day} >{moment().format('MMMDo')} | {moment().format('dddd')}</div>
						</div>
					</Col>
				</Row>
			</ReactResizeDetector>
			<ConfigBar widgetKey={widgetKey} editMode={editMode} handleDeleteWidget={handleDeleteWidget} />
		</div>
	)
}



export default Widget

export { SnapShot, modelRegisterKey }
