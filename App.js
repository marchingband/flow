import React, { Component } from 'react';
import {
  Alert,
  Animated,
  AppRegistry,
  AsyncStorage,
  Button,
  Easing,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import SortableList from 'react-native-sortable-list';
import ReactTimeout from 'react-timeout';
import ModalDropdown from 'react-native-modal-dropdown';

const window = Dimensions.get('window');
const AnimatedFlatList = new Animated.createAnimatedComponent(FlatList)

class FileSavedAlert extends Component{
  constructor(props) {
    super(props)
    this.state={
      modalVisible:false,
      fade: new Animated.Value(1)
    }
  }
  fadeOut() {
    this.state.fade.setValue(1)
    Animated.timing(                  
       this.state.fade,            
       {
         toValue: 0,                   
         duration: 1000,         
       }
    ).start(()=>this.setModalVisible(false));                        
  }
  setModalVisible(visible) {
    if(visible==true){
    this.state.fade.setValue(1)
    this.setState({modalVisible: visible})
    this.props.setTimeout(() => {
      this.fadeOut()},1500)
  }else{
    this.setState({modalVisible: visible})
  }
  }
  render() {
    return (
      
      <Modal
        fullScreen={true}
        overFullScreen={true}
        transparent = {true}
        animationType = "fade"
        visible={this.state.modalVisible}
      >
        <Animated.View style={{opacity: this.state.fade}}>
          <View style={styles.alertContainer}>
            <View style={styles.alert}>
              <Text>File Saved</Text>
            </View>
          </View>
        </Animated.View>
      </Modal>
      
      )
  }
}

class DeteleFilesModal extends Component{
  constructor(props) {
    super(props)
    this.state ={
      modalVisible : false,
      fileNames : [],
    }
  }
  setModalVisible(visible) {
    this.getFilenames()
    this.setState({modalVisible:visible})
  }
  async getFilenames() {
    var fileNames = []
    await AsyncStorage.getAllKeys().then((ks)=> {
      storedValues = ks.sort()
      for(var i =0; i<storedValues.length ; i++){
        fileNames[i]={'key':storedValues[i],'selected':false}
      }
      this.setState({fileNames})
    })
  }
  selectFile(key){
    var oldData = this.state.fileNames
    var newData = []
    for(var i =0;i<oldData.length;i++){
      var file = oldData[i]
      var fileName = file.key
      var oldSelected = file.selected
      if(fileName==key){
        newData[i]={'key':fileName,'selected':!oldSelected}
      } else {
        newData[i]={'key':fileName,'selected':oldSelected}
      }
    }
    this.setState({fileNames:newData})
  }
  getBackgroundColor=(selected)=>{
    if(!selected){
      return '#fff'
    } else {
      return 'tomato'
    }
  }
  async deleteFile(fileName){
    await AsyncStorage.removeItem(fileName)
  }
  async deleteIfSelected(file){
    const selected = file.selected
    const name = file.key
    if(selected){await deleteFile(name)}
  }
  async deleteSelectedFiles() {
    var files = this.state.fileNames
    for (const file of files) {
      if(file.selected == true){
        await AsyncStorage.removeItem(file.key)
      }
    }
    this.getFilenames()
  }
  render() {
    return (
      <View style={styles.menuContainer}>
        <Modal
          animationType = "slide"
          visible={this.state.modalVisible}
          >
          <View style={styles.menuView}>
            <TouchableOpacity 
                style={styles.menuItemTouchableCancel}
                onPress={()=>{this.deleteSelectedFiles()}}
            >
              <Text style={styles.menuItemText}>delete selected</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItemTouchableCancel}
              onPress={()=>{this.setModalVisible(false)}}
            >
              <Text style={styles.menuItemText}>done</Text>
            </TouchableOpacity>
            <FlatList
              data={this.state.fileNames}
              renderItem={({item}) => 
                <TouchableOpacity 
                  style={{
                    backgroundColor: this.getBackgroundColor(item.selected),
                    padding: 3,
                    height: 25,
                    width:window.width,
                    borderRadius: 4,
                    borderWidth: 0.5,
                    borderColor: '#d6d7da',
                  }}
                  onPress={()=>{this.selectFile(item.key)}}
                >
                  <Text style={styles.text}>{item.key}</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </Modal>
      </View>

    )
  }
}

class LoadModal extends Component {
  constructor(props) {
    super(props)
    this.state={
      modalVisible : false,
      fileNames : [],
      file:null,
      fileContents:'',
    }
  }
  
  setModalVisible(visible) {
    this.setState({modalVisible: visible})
    this.load()
  }
  async load(){
    var storedValues = []
    var fileNames = []
    await AsyncStorage.getAllKeys().then((ks)=> {
      storedValues = ks.sort()
      for(var i =0; i<storedValues.length ; i++){
        fileNames[i]={'key':storedValues[i]}
      }
      this.setState({fileNames})
    })
  }
  async loadFile(key){
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null){
        var newValue = JSON.parse(value)
        var newData=newValue.data
        var newOrder=newValue.order
        var highestId=newValue.highestId
        var newFlowName =newValue.flowTitle
        this.setModalVisible(false) 
        this.props.onClickLoad(newData, newOrder, highestId, newFlowName)
        
      }
    } catch (error) {
    }   
  }
  render() {
    return (
      <View style={styles.menuContainer}>
        <Modal
          animationType = "slide"
          visible={this.state.modalVisible}
        >
          <View style={styles.menuView}>
            <Text style={{margin:10}}>open file... </Text>
            <FlatList
              data={this.state.fileNames}
              renderItem={({item}) => 
                <TouchableOpacity 
                  style={styles.pose} 
                  onPress={()=>{this.loadFile(item.key)}}
                >
                  <Text style={styles.text}>{item.key}</Text>
                </TouchableOpacity>
              }
            />
            <TouchableOpacity 
              style={styles.menuItemTouchableCancel}
              onPress={()=>{this.setModalVisible(false)}}
            >
              <Text style={styles.menuItemText}>cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
      )
  }
}

class SaveModal extends Component {
  constructor(props) {
    super(props)
    this.state={
      modalVisible : false,
      text : '',
      data : {},
    }
  }
  setModalVisible(visible) {
    this.setState({modalVisible: visible})
    this.setState({text:''})
  }
  async save(){
    var newFileName = this.state.text
    var fileNames = []
    await AsyncStorage.getAllKeys().then((ks)=> {
      fileNames = ks
      if(fileNames.includes(newFileName)){
        this.setModalVisible(false)
        Alert.alert(
          'Save File',
          'That filename already exists. Do you wish to overwrite?',
          [
            {text:'Yes', onPress:()=>this.overwriteFile(newFileName)},
            {text:'No', onPress:()=>this.setModalVisible(true)},
          ],
        )
      }else{
        this.saveFile(newFileName)
      }
    })
  }

  async overwriteFile(newFileName){
    await AsyncStorage.removeItem(newFileName).then(()=>{
      this.saveFile(newFileName)
    })
  }

  async deleteFile(fileName){
    await AsyncStorage.removeItem(fileName)
  }
  
  async saveFile(newFileName){
    this.props.setFlowName(newFileName)
    var flowObject = this.props.getStateData()
    var flowString = JSON.stringify(flowObject)
    await AsyncStorage.setItem(newFileName, flowString)
    this.setModalVisible(false)
    this.props.fileSavedAlert()
  }
  render() {
    return (
      <View style={styles.menuContainer}>
        <Modal
          animationType = "slide"
          transparent={false}
          visible={this.state.modalVisible}
        >
          <View style={styles.menuView}>
            <TextInput
              onChangeText={(text) => {this.setState({text})}}
              placeholder = 'file name...'
              autoFocus={true}
              value={this.state.text} 
            />
            <TouchableOpacity 
              style={styles.menuItemTouchable}
              onPress={()=>{this.save(this.state.text)}}
              keyboardShouldPersistTaps='always'
              keyboardDismissMode='on-drag'
            >
              <Text style={styles.menuItemText}>save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItemTouchable}
              onPress={()=>{this.setModalVisible(false)}}
              keyboardDismissMode='on-drag'
            >
              <Text style={styles.menuItemText}>cancel</Text>
            </TouchableOpacity>
            <Text>{this.props.flow}</Text>
          </View>
        </Modal>
      </View>
    )
  }
}

class MenuModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalVisible : false,
    }
  }
  new=()=>{
    this.setModalVisible(false)
    this.props.new()
  }
  save=()=>{
    var flowName = this.props.getCurrentFlowName()
    if(flowName == ''){
      this.props.save()
    this.setModalVisible(false)
  } else {
    this.setModalVisible(false)
    this.props.updateSavedFile()
  }
  }
  saveAs=()=>{
    this.setModalVisible(false)
    this.props.save()
    
  }
  load=()=>{
    this.setModalVisible(false)
    this.props.load()
  }
  deleteFiles=()=>{
    this.setModalVisible(false)
    this.props.deleteFiles()
  }
  cancel = () => {this.props.cancel()}
  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }
  render() {
    return (
      <View style={styles.menuContainer}>
        <Modal
          animationType = "slide"
          transparent={false}
          visible={this.state.modalVisible}
          >
          <View style={styles.menuView}>
              <TouchableOpacity style={styles.menuItemTouchable}
                onPress={()=>{
                  this.new()
                }}>
                <Text style={styles.menuItemText}>new</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItemTouchable}
                onPress={()=>{
                  this.save()
                }}>
                <Text style={styles.menuItemText}>save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItemTouchable}
                onPress={()=>{
                  this.saveAs()
                }}>
                <Text style={styles.menuItemText}>save as...</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItemTouchable}
                onPress={()=>{
                  this.load()
                }}>
                <Text style={styles.menuItemText}>open</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItemTouchable}
                onPress={()=>{
                  this.deleteFiles()
                }}>
                <Text style={styles.menuItemText}>delete saved file(s)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItemTouchable}
                onPress={()=>{
                  this.setModalVisible(!this.state.modalVisible)
                }}>
                <Text style={styles.menuItemText}>cancel</Text>
              </TouchableOpacity>
            
          </View>
        </Modal>
      </View>
    )
  }
}

class Row extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0)
    }
    this._active = new Animated.Value(0);
    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },
        android: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.07],
            }),
          }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      })
    };
  }
  componentDidMount() {
    Animated.timing(                  
      this.state.fadeAnim,            
      {
        toValue: 1,                   
        duration: 500,             
      }
    ).start();                        
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        toValue: Number(nextProps.active),
      }).start();
    }
  }
  
  render() {
   let { fadeAnim } = this.state;
   const {data, active, erase, insert, changeDirection} = this.props;
   const imageUri = data.url
   const flip     = data.direction == 'L' ? '0deg' : '180deg'
    return (
    <Animated.View style={{opacity:fadeAnim}}>
      <Animated.View style={[
        styles.row,
        this._style,
      ]}>
        <Image
          style={{width: 48, 
            height: 48,
            transform: [{rotateY:flip}]}}
            source={{uri: imageUri}}
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={()=>{
            this.props.changeDirection(data.id);
            this.forceUpdate()}
          }
        >
          <Text style={styles.buttonText}>{data.direction}</Text>        
        </TouchableOpacity>        
        <Text style={styles.text}>{data.text}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={()=>{this.props.erase(data.id)}}
        >
          <Text style={styles.buttonText}>X</Text>        
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={()=>{this.props.insert(data.id)}}
        >
          <Text style={styles.buttonText}>I</Text>        
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
    );
  }
}

export default class App extends React.PureComponent {
  state = {
    flowName   : '',
    filterText : '',
    currentCat : 'all',
    posesList  : [
      {key: 'Downward Dog',   tags: ['seated']   , url: 'http://www.pocketyoga.com/images/poses/downward_dog.png'},
      {key: 'Sun Salutation', tags: ['seated']   , url: 'http://www.pocketyoga.com/images/poses/mountain.png'},
      {key: 'Crow',           tags: ['standing'] , url: 'http://www.pocketyoga.com/images/poses/crow.png'},
      {key: 'Half Moon',      tags: ['standing'] , url: 'http://www.pocketyoga.com/images/poses/half_moon_R.png'},
      {key: 'Child',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/child_traditional.png'},
      {key: 'Awkward',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/awkward.png'},
      {key: 'Balancing the Cat',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/cat_balance_R.png'},
      {key: 'Bird of Paradise',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/chair_twist_bind_up_R.png'},
      {key: 'Boat',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/boat_full.png'},
      {key: 'Bound Angle',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/bound_angle.png'},
      {key: 'Bow',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/bow.png'},
      {key: 'Bow Half',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/bow_half_R.png'},
      {key: 'Box',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/box_neutral.png'},
      {key: 'Bridge',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/bridge.png'},
      {key: 'Camel',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/camel.png'},
      {key: 'Cat',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/cat.png'},
      {key: 'Caterpillar',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/caterpillar.png'},
      {key: 'Chair',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/chair.png'},
      {key: 'Extended Child',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/child.png'},
      {key: 'Cobra',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/cobra.png'},
      {key: 'Corpse',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/corpse.png'},
      {key: 'Front Corpse',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/corpse_front.png'},
      {key: 'Cow',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/dog.png'},
      {key: 'Crescent Moon',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/crescent_moon_R.png'},
      {key: 'Dead Mans',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/deaf_man.png'},
      {key: 'Dolphin',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/dolphin.png'},
      {key: 'Eagle',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/eagle_L.png'},
      {key: 'Easy',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/easy.png'},
      {key: 'Eight Angle',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/eight_angle_L.png'},
      {key: 'Extended Puppy',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/puppy_extended.png'},
      {key: 'Fire Log',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/fire_log_R.png'},
      {key: 'Firefly',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/firefly.png'},
      {key: 'Fish',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/fish.png'},
      {key: 'Flying Man',   tags: []   , url: 'http://www.pocketyoga.com/images/poses/lunge_hands_on_mat_flying_L.png'},
    ],
    newId : 0,
    posesModalVisible : false,
    menuModalVisible : false,
    data      : {},
    order     : [],
    text      : '',
    insertAt  : 0,
    inserting : null,
  }
  new=()=>{
    Alert.alert(
          'New File',
          'Start new flow? Your current flow will be lost if unsaved!',
          [
            {text:'Yes', onPress:()=>this.setState({flowName:'',newId:0,data:{},order:[]})},
            {text:'No', onPress:()=>this.menuModal.setModalVisible(true)},
          ],
        )
  }

  setFlowName=(newName)=>{
    this.setState({flowName:newName})
  }

  setPosesModalVisible(visible) {
    this.setState({filterText:''})
    this.setState({posesModalVisible:visible})
    this.getOrder()
  }
  deleteFiles=()=>{
    this.deleteFilesModal.setModalVisible(true)
  }
  setMenuModalVisible(visible) {
    this.menuModal.setModalVisible(visible)
  }
  onChangeFilterText = (filterText) => {
    this.setState({filterText})
  }
  onChangeFilterMoves = (currentCat) => {
    this.setState({currentCat})
  }
  getNewId=()=>{
    this.setState({newId:this.state.newId+1})
    return this.state.newId
  }
  getOrder=()=>{
    let newOrder=this.sortList.state.order
    this.setState({order:newOrder})
  }
  getStateData=()=>{
    var flowData = this.state.data
    var flowOrder = this.sortList.state.order
    var flowName = this.state.flowName
    var id = this.state.newId
    var newData = {data:{...flowData},order:[...flowOrder],highestId:id,flowTitle:flowName}
    return newData
  }
  onClickLoad = (a,b,c,d) => {
    Alert.alert(
          'Load File',
          'Load flow? Your current flow will be lost if unsaved, and any changes will be lost!',
          [
            {text:'Yes', onPress:()=>this.setStateOrderAndData(a,b,c,d)},
            {text:'No', onPress:()=>{}},
          ],
        )
  }
  setStateOrderAndData = (newData, newOrder, highestId, newFlowName) => {
    this.setState({data:newData, order:newOrder})
    var newHighestId = Number(highestId)
    this.setState({newId:newHighestId})
    this.setState({flowName:newFlowName})
  }
  getIndexOf=(id)=>{
    let orderList = this.sortList.state.order
    for (var i = orderList.length - 1; i >= 0; i--) {
      if (orderList[i] == id) {
        return i
      }
    }
  }
  addPose(pose, newUrl) {
    let inserting = this.state.inserting
    if (inserting === true) {
      let indexToInsert = this.getIndexOf(this.state.insertAt)
      let oldOrder = this.sortList.state.order
      let oldList = this.state.data
      let uid = this.getNewId()
      let newOrder = oldOrder.splice(indexToInsert,0,uid)
      var newItem = {}
      newItem[uid] = {text:pose,id:uid,direction:'L',url:newUrl}
      let newList = {...oldList,...newItem}
      this.setState({data:newList})
      this.setState({order:newOrder})
      this.setState({inserting:null})
      this.setPosesModalVisible(false)
    } else {
      let oldOrder = this.sortList.state.order
      let oldList = this.state.data
      let uid = this.getNewId()
      let newOrder = [...oldOrder,uid]
      var newItem = {}
      newItem[uid] = {text:pose,id:uid,direction:'L',url:newUrl}
      let newList = {...oldList,...newItem}
      this.setState({data:newList})
      this.setState({order:newOrder})
      this.setState({posesModalVisible:false})
    }
  }
  load=()=> {this.loadModal.setModalVisible(true)}
  save=()=> {this.saveModal.setModalVisible(true)}
  updateSavedFile=()=>{
    this.saveModal.overwriteFile(this.state.flowName)
  }
  fileSavedAlert=()=>{
    this.fileSavedModal.setModalVisible(true)
  }
  getCurrentFlowName=()=>{
    var name = this.state.flowName
    return name
  }
  render() {
    const filterRegex = new RegExp(String(this.state.filterText), 'i');
    const filter = (item) => (
      filterRegex.test(item.key)
    );
    const catFilter = (item) => {
      if(this.state.currentCat = 'all'){
        return true
      } else {
        var tags = item.tags
        var cat = this.state.currentCat
        return tags.includes(cat)
      }
    };
    const filteredData = this.state.posesList.filter(filter).filter(catFilter);

    return (
      <View style={styles.container}>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={()=>{this.setMenuModalVisible(true)}}>
            <Text style={styles.title}> menu </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={()=>{this.setPosesModalVisible(true)}}>
            <Text style={styles.title}> ADD POSE </Text>
          </TouchableOpacity>
        </View>
        <MenuModal
          ref={i=>{this.menuModal=i}}
          new={this.new}
          load={this.load}
          save={this.save}
          updateSavedFile={this.updateSavedFile}
          fileSavedAlert={this.fileSavedAlert}
          getCurrentFlowName={this.getCurrentFlowName}
          deleteFiles={this.deleteFiles}
          />
        <LoadModal
          ref={i=>{this.loadModal=i}}
          setStateData={this.setStateData}
          setStateOrder={this.setStateOrder}
          onClickLoad={this.onClickLoad}
          />
        <SaveModal
          ref={i=>{this.saveModal=i}}
          data={this.state.data}
          getStateData={this.getStateData}
          getCurrentFlowName={this.getCurrentFlowName}
          setFlowName={this.setFlowName}
          fileSavedAlert={this.fileSavedAlert}
          />
        <DeteleFilesModal
          ref={i=>{this.deleteFilesModal=i}}
        />
        <FileSavedAlert
          ref={i=>{this.fileSavedModal=i}}
          setTimeout={setTimeout}
          />
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.posesModalVisible}
          >
          <View style={styles.menuView}>
            <TouchableOpacity 
              style={styles.menuItemTouchableCancel}
              onPress={()=>{this.setPosesModalVisible(false);this.setState({inserting:null})}}>
              backgroundColor='#eee'
              <Text style={styles.menuItemText}>cancel</Text>
            </TouchableOpacity>
            <View style={styles.loadFiltersBar}>
              <TextInput
                style={{height:30,borderRadius:2,borderWidth:1,borderColor:'black',flex:4,alignItems:'flex-start'}}
                onChangeText = {this.onChangeFilterText}
                placeholder = 'Search...'
                value={this.state.filterText}
                autoFocus={true} 
              />
              <ModalDropdown
                style={{flex:1, backgroundColor:'pumpkin', height:30,width:100,borderRadius:2,borderWidth:1,borderColor:'black',alignItems:'flex-end'}}
                defaultValue={this.state.currentCat}
                options={['all', 'seated','standing', 'seated','standing', 'seated','standing']}
                onSelect={(i,value)=>this.onChangeFilterMoves(value)}
              />
            </View>
            <AnimatedFlatList
              keyboardShouldPersistTaps='always'
              keyboardDismissMode='on-drag'
              data={filteredData}
              renderItem={({item}) => 
                <TouchableOpacity 
                  style={styles.pose} 
                  onPress={()=>{this.addPose(item.key,item.url)}}>
                  <Text style={styles.text}>{item.key}</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </Modal>
        <Text style={{color:'black'}}>{this.state.flowName}</Text>
        <SortableList
          ref={(i)=>this.sortList=i}
          style={styles.list}
          contentContainerStyle={styles.contentContainer}
          data={this.state.data}
          order={this.state.order}
          renderRow={this._renderRow} />
      </View>
    );
  }

  erase = (id)=>{
    var oldList = this.state.data
    let oldOrder= this.sortList.state.order
    delete oldList[id]
    let newOrder = oldOrder.filter(e => e !== id)
    this.setState({order:newOrder})
    this.setState({data:oldList})
  }
  insert = (id)=>{
    this.setState({insertAt:id})
    this.setState({inserting:true})
    this.setPosesModalVisible(true)
  }
  changeDirection = (id) => {
    var list = this.state.data
    let poseDirection = this.state.data[id].direction
    if (poseDirection=='L') {
      list[id].direction = 'R'
    } else {
      list[id].direction = 'L'
    }
    this.setState({data:list})
  }
  _renderRow = ({data, active}) => {
    return <Row data={data} active={active} erase={this.erase} posesList={this.posesList} insert={this.insert} changeDirection={this.changeDirection}/>
  }
}

const styles = StyleSheet.create({
  dropdown_2: {
    alignSelf: 'flex-end',
    width: 150,
    marginTop: 32,
    right: 8,
    borderWidth: 0,
    borderRadius: 3,
    backgroundColor: 'cornflowerblue',
  },
  loadFiltersBar:{
    marginTop:10,
    marginBottom:10,
    marginRight:4,
    marginLeft:4,
    flexDirection:'row',
    justifyContent:'center',
    alignItems: 'center',
    height:20,
    width:window.width,
  },
  fileList:{
    flex:1,
  },
  alertContainer :{
    width:window.width,
    height:window.height,
    justifyContent:'center',
    alignItems:'center',
  },
  alert :{
    justifyContent:'center',
    alignItems:'center',
    height:80,
    width:200,
    borderRadius:4,
    borderWidth:1,
    borderColor:'black',
    backgroundColor:'white',
  },
  loadList :{
    marginTop : 40,
  },
  menuContainer:{
    flexDirection :'column',
  },
  menuItemText: {
    fontSize:20,
    color:'black',
  },
  menuItemTouchable:{
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
    backgroundColor : '#eee',
    
    marginLeft:10,
    marginRight:10,
    marginTop:3,
    marginBottom:0,
    alignItems: 'center',
    justifyContent: 'center',
    height : 30,
  },
  menuItemTouchableCancel:{
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
    backgroundColor : '#eee',
    
    marginLeft:10,
    marginRight:10,
    marginTop:3,
    marginBottom:0,
    alignItems: 'center',
    justifyContent: 'center',
    height : 30,
  },
  menuView: {
    flexDirection:'column',
    flex:1,
    marginTop:40,
    marginBottom:10,
  },

  addButton:{
    flex:7,
    backgroundColor: '#fff',
    flexDirection:'row',
    height:50,
    alignItems: 'center',
    justifyContent: 'center',
    padding:3,
  },
  menuButton:{
    flex:1,
    backgroundColor: '#fff',
    flexDirection:'row',
    height:50,
    alignItems: 'center',
    justifyContent: 'center',
    padding:3,

  },
  headerButtons:{
    backgroundColor: '#fff',
    flexDirection:'row',
    height:50,
    alignItems: 'center',
    justifyContent: 'center',
    padding:3,

  },
  pose: {
    backgroundColor: '#fff',
    padding: 3,
    height: 25,
    width:window.width,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  button: {
    alignItems: 'center',
    flex:1,
    backgroundColor: 'powderblue'
  },
  buttonText: {
    flex:1,
    fontSize:20,
    color:'white'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',

    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
    }),
  },

  title: {
    fontSize: 12,
    paddingTop:30,
    color: '#999999',
  },

  list: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentContainer: {
    width: window.width,

    ...Platform.select({
      ios: {
        paddingHorizontal: 0,
      },

      android: {
        paddingHorizontal: 0,
      }
    })
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 3,
    height: 50,
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 4,
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#d6d7da',


    ...Platform.select({
      ios: {
        
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 0,
        shadowOffset: {height: 2, width: 2},
        shadowRadius: 2,
      },

      android: {
        width: window.width - 30 * 2,
        elevation: 0,
        marginHorizontal: 30,
      },
    })
  },

  image: {
    width: 50,
    height: 50,
    marginRight: 30,
    borderRadius: 25,
  },

  text: {
    flex: 8,
    fontSize: 14,
    color: '#222222',
  },
});