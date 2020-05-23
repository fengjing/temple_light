"use strict";

import React        from 'react';
import ReactDOM     from 'react-dom';
import {  Button, Menu,  Icon, Modal,Input,Table,Form ,message,Alert} from 'antd';
import {MyLayout}     from '../common/layout.js';
import { browserHistory} from 'react-router';
const FormItem = Form.Item;
var AddAdmin = React.createClass({
	getInitialState: function() {
		return{
			records:[],
			"pagination": {
					"showSizeChanger":true,
					//defaultPageSize: 10,
					//defaultCurrent : 1,
					"current"        : 1,
					"pageSize"       : 10,
					"pageSizeOptions": ['10', '25', '50', '100']
			},
			selectedRowKeys:[],
			loading:true,
			show:false,
			visible:false,
			key:0,
			required:true,
			title:'',
			errormsg:null
		}
			 
	},
	componentWillMount:function(){
		this.get_agent(1,10);
	},
	componentDidMount:function(){
	 
	},
	get_agent:function(page,psize){
		let self = this;
		const pager = this.state.pagination;
		let url = window.API_PREFIX+'/god/god/fetch?page='+page+'&psize='+psize;
		var callback = function(err,res){
			if(err){
				 console.log(err);
			}else{
				console.log(res.body);
				pager.total = res.body.data.count;
				res.body.data.gods.forEach((d,i)=>{
					d.key = i;
				})
				self.setState({records:res.body.data.gods,pagination:pager,loading:false});
			}
		};
		var xhr  = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8") ; 
		xhr.send(null);
		xhr.onreadystatechange = function() {
			if(xhr.readyState === XMLHttpRequest.DONE) {
				if(xhr.status === 200) {
					callback(null,{body:JSON.parse(xhr.responseText)});
				} else {
					callback({err:JSON.parse(xhr.responseText)},null);
				}
			}
		};
	},
	onTableChange:function(pagination, filters, sorter) {
		const pager = this.state.pagination;
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;
		this.setState({
				pagination: pager,
		});
		this.get_agent(pager.current,pager.pageSize);
	},
	show_fn:function(){
		this.setState({visible:true,title:'添加',required:true});
	},
	handleCancel:function(){
		this.setState({visible:false,key:Math.random()});
	},
	handleSubmit:function(e){
		let self = this;
		e.preventDefault();
		const pager = this.state.pagination;
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				console.log('Received values of form: ', values);
				let url,data;
				url = window.API_PREFIX+'/god/god/add';
				var callback = function(err,res){
					if(err){
						console.log(err);
						self.setState({errormsg:err.err.msg});
					}else{
						console.log(res.body);
						self.get_agent(pager.current,pager.pageSize);
						message.success('成功');
						self.setState({errormsg:null,visible:false,key:Math.random()});
					}
				};
				var xhr  = new XMLHttpRequest();
				xhr.open('PUT', url);
				xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8") ; 
				xhr.send(JSON.stringify(values));
				xhr.onreadystatechange = function() {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(xhr.status === 200) {
							callback(null,{body:JSON.parse(xhr.responseText)});
						} else {
							callback({err:JSON.parse(xhr.responseText)},null);
						}
					}
				};
			}
		})
	},
	show_list:function(id){
		sessionStorage.setItem('getlist',id);
		browserHistory.push(window.URL_PREFIX+'/adminlist');
	},
	render: function (){
		let self = this;
		let alert = null;
		const { getFieldDecorator, getFieldValue } = this.props.form;

		const columns = [ {
								title: '姓名',
								dataIndex: 'name',
								render:(text,re) => <a onClick={self.show_list.bind(self,re.id)}>{text}</a>,
						},{
								title: '手机号',
								dataIndex: 'phone',
						},{
								title: '邮箱',
								dataIndex: 'email',
						},{
								title: '备注',
								dataIndex: 'remark',
						}];
		if(self.state.errormsg){
			alert = <Alert message={self.state.errormsg} type='error'/>
		}
		return (
			<MyLayout>
				<div style = {{height:'8vh'}}>
					<div style={{height:'100%',verticalAlign:'middle',display:'inline-block'}}></div>
					<Button onClick = {self.show_fn}>添加管理员</Button>
				</div>
				<Table
					loading={self.state.loading}
					columns={columns} 
					dataSource={self.state.records} 
					onChange={self.onTableChange} 
					pagination={self.state.pagination}
				/>
				<Modal 
					width="400px"
					title={self.state.title} 
					visible={self.state.visible}
					onCancel={self.handleCancel}
					key={self.state.key}
					footer={null}
				>
					<Form onSubmit={self.handleSubmit} >
					<FormItem >
						{getFieldDecorator('name', {
							rules: [{
								required: self.state.required, message: '请填写完毕后提交',
							}]
						})(
							<Input type='text' placeholder="请输入姓名" />
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator('phone', {
							validateTrigger:'onBlur',
							rules: [{
								required: self.state.required, message: '请填写完毕后提交'
							},{
								pattern:/^1[34578][0-9]{9}$/, message: '请填写正确的手机号'
							}]
						})(
							<Input type='text' placeholder="请填写手机号" />
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator('email', {
							validateTrigger:'onBlur',
							rules: [{
								required: self.state.required, message: '请填写完毕后提交',
							},{pattern:/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/, message: '请填写正确的邮箱',}]
						})(
							<Input type='text' placeholder="请填写邮箱" />
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator('remark', {
							initialValue:''
							
						})(
							<Input type='text' placeholder="请输入备注" />
						)}
					</FormItem>
					{alert}
					 <Button key="back" size="large" onClick={self.handleCancel}>取消</Button>,
						<Button key="submit" type="primary" size="large" htmlType='submit'>提交</Button>
				</Form>
				</Modal>
			</MyLayout>
		);
	}
});

AddAdmin = Form.create()(AddAdmin);
export default AddAdmin;
export { AddAdmin };