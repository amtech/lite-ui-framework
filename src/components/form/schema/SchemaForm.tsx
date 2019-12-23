import React, { useCallback, useContext } from 'react'
import { BlockHeader, EditStatus } from 'gantd'
import { Form, Row } from 'antd';
import { Schema, Types, UISchema, TitleSchema } from './interface'
import { FormContext } from './index'
import SchemaFiled from './SchemaFiled'
import SchemaTable from './SchemaTable'
import classnames from 'classnames'
import { get, isEmpty } from 'lodash'
import { getOrders, getUIData, getEdit, getTitle, getBackgroundColor } from './utils'
import { allOperators } from '@/components/specific/smartsearch/operators'
import styles from './index.less'

interface SchemaFormProps {
	schema: Schema,
	uiSchema?: UISchema,
	titleConfig?: TitleSchema,
}
export default function SchemaForm(props: SchemaFormProps) {
	const { uiSchema, schema, titleConfig } = props;
	const { edit, form: { getFieldDecorator }, data } = useContext(FormContext);
	const renderPropTypeContent: any = useCallback((item: Schema, pathName: string, required: string[]) => {
		const { type } = item;
		switch (type) {
			case Types.object:
				return renderContent(pathName);

			case Types.table:
				return renderTable(item, pathName)
			default:
				if (isEmpty(item)) return null;
				const nameArray = pathName.split('.');
				const itemName = nameArray[nameArray.length - 1];
				const isRequired = required && required.indexOf(itemName) >= 0;
				const operatorObj = allOperators[item.operator];
				const hasOperator = !isEmpty(operatorObj);
				const filedTitle = hasOperator ? `${item.title}(${operatorObj.name})` : item.title
				const filedEdit = getEdit(edit, pathName);
				const { orders, gutter, ...itemUiData } = getUIData(uiSchema, pathName);
				return <SchemaFiled
					key={pathName} {...item}
					title={filedTitle}
					name={pathName}
					uiData={itemUiData}
					isRequired={isRequired}
					edit={filedEdit} />
		}
	}, [uiSchema, schema, edit])
	const renderContent = useCallback((pathName?: string) => {
		let schemaData = schema;
		if (pathName) {
			const nameArray = pathName.split('.');
			const getName = nameArray.join('.propertyType.')
			schemaData = get(schema, `propertyType.${getName}`)
		}
		const { orders, gutter, backgroundColor, padding } = getUIData(uiSchema, pathName);
		const { propertyType, required, title, type } = schemaData;
		// 渲染table
		if (type === Types.table) return renderTable(schemaData, pathName)

		if (isEmpty(propertyType)) return null
		const propertyTypeArray = Object.keys(propertyType);
		//处理排序
		const orderKeys = getOrders(orders, propertyTypeArray)
		//处理编辑状态；
		const filedEdit = getEdit(edit, pathName);
		//处理header
		const titleSchema = getTitle(titleConfig, pathName);
		const contents = orderKeys.map(itemName => {
			const item = propertyType[itemName];
			const itemPathName = pathName ? `${pathName}.${itemName}` : itemName;
			return renderPropTypeContent(item, itemPathName, required)
		})
		const pathNameArray = pathName ? pathName.split('.') : [];
		const id = pathNameArray[pathNameArray.length - 1];
		const containerColor = getBackgroundColor(backgroundColor, pathNameArray.length);
		return <div className={classnames(styles.schemaCard, filedEdit === EditStatus.EDIT && styles.showRequiredMark)}
			key={pathName}
			style={{ padding: padding, backgroundColor: containerColor, }}  >
			{(pathName ? titleSchema.visible : title) && <BlockHeader title={title}  {...titleSchema} id={titleSchema.id ? titleSchema.id : id} />}
			<Row gutter={gutter}>
				{
					contents
				}
			</Row>
		</div>
	}, [schema, edit, titleConfig, uiSchema])
	const renderTable = (schema, pathName?: string) => {
		const titleSchema = getTitle(titleConfig, pathName);
		pathName = pathName ? pathName : "schemaTable"
		let initialValue = pathName ? get(data, pathName, undefined) : data;
		initialValue = initialValue ? initialValue : []
		return getFieldDecorator(pathName, {
			initialValue
		})(<SchemaTable
			key={pathName}
			schema={schema}
			titleSchema={titleSchema}
		/>
		)
	}
	return <Form className={styles.schemaForm} hideRequiredMark  >
		{renderContent()}
	</Form>;
}


