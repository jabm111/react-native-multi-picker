import React, {
    Component,
    View,
    Picker,
    TouchableHighlight,
    Text,
    Dimensions,
    StyleSheet
} from 'react-native';
const WIN = Dimensions.get('window');

export default class CustomPicker extends Component {
    constructor(props) {
        super(props);
        this.isReady = false;

        this.state = {
            selections: {},
            optionLists: []
        };

        this.renderPickers = this.renderPickers.bind(this);
        this.renderPickerOptions = this.renderPickerOptions.bind(this);
        this.handlePressDone = this.handlePressDone.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.initOptionLists = this.initOptionLists.bind(this);
        this.initSelections = this.initSelections.bind(this);
        this.getOptionalStyle = this.getOptionalStyle.bind(this);
    }

    componentDidMount() {
        this.initOptionLists(this.props.options);
    }

    initOptionLists(options) {
        let optionLists = [ ...options ];

        options.forEach((optionList, index) => {
            if (optionList.bounds && optionList.bounds.length === 2) {
                const boundedValues = this.getValuesBoundedBy(optionList.bounds[0], optionList.bounds[1]);
                optionLists[index].options = boundedValues;
            }
        });

        this.initSelections(optionLists);
    }

    initSelections(optionLists) {
        let selections = {};

        optionLists.forEach((optionList) => {
            selections[optionList.name] = optionList.options[0].value;
            
            optionList.options.forEach((option) => {
                if (optionList.defaultLabel && optionList.defaultLabel === option.label) {
                    selections[optionList.name] = option.value;
                }
            });
        });

        this.setState({
            selections,
            optionLists
        });

        this.isReady = true;
    }

    getValuesBoundedBy(bound1, bound2) {
        const ASC = bound1 < bound2;
        const min = ASC ? parseInt(bound1) : parseInt(bound2);
        const max = ASC ? parseInt(bound2) : parseInt(bound1);
        let options = [];

        for (i = min; i <= max; i++) {
            options.push({
                label: String(i),
                value: i
            });
        }

        return ASC ? options : options.reverse();
    }

    handlePressDone() {
        if (!this.isReady) {
            return;
        }

        this.props.onDone(this.state.selections);
    }

    handleValueChange(value, name) {
        let selections = { ...this.state.selections };
        selections[name] = value;

        this.setState({ selections });
    }

    renderPickerOptions(options) {
        return options.map((option) => {
            return (
                <Picker.Item
                    key={option.label}
                    label={option.label}
                    value={option.value}
                />
            );
        });
    }

    getSelectedValueFor(optionList) {
        if (this.state.selections.hasOwnProperty(optionList.name)) {
            return this.state.selections[optionList.name];
        }
    }

    renderListTitle(optionList) {
        if (optionList.title) {
            return (
                <View style={styles.listTitleWrapper}>
                    <Text
                        style={[styles.listTitle, this.getOptionalStyle('listTitle')]}
                        allowFontScaling={this.props.allowFontScaling}
                    >
                        {optionList.title}
                    </Text>
                </View>
            );
        }
    }

    renderPickers(optionLists) {
        return optionLists.map((optionList) => {
            return (
                <View
                    key={optionList.name}
                    style={[
                        styles.pickerWrapper,
                        {
                            width: (WIN.width - (2 * this.props.padding) - (2 * this.props.borderWidth)) / this.state.optionLists.length
                        }
                    ]}
                >
                    {this.renderListTitle(optionList)}
                    <Picker
                        style={styles.picker}
                        selectedValue={this.getSelectedValueFor(optionList)}
                        onValueChange={(value) => this.handleValueChange(value, optionList.name)}
                        prompt={optionList.title ? optionList.title : null}
                        mode={'dialog'}
                        itemStyle={this.props.itemStyle}
                    >
                        {this.renderPickerOptions(optionList.options)}
                    </Picker>
                </View>
            );
        });
    }

    renderPrompt() {
        if (this.props.prompt) {
            return (
                <View style={styles.promptWrapper}>
                    <Text
                        style={[styles.prompt, this.getOptionalStyle('prompt')]}
                        allowFontScaling={this.props.allowFontScaling}
                    >
                        {this.props.prompt}
                    </Text>
                </View>
            );
        }
    }

    getOptionalStyle(key) {
        if (this.props.style.hasOwnProperty(key)) {
            return this.props.style[key];
        }
        return null;
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={[
                    styles.popup,
                    {
                        width: WIN.width - (2 * this.props.padding), borderWidth: this.props.borderWidth
                    },
                    this.getOptionalStyle('popup')
                ]}
                >
                    {this.renderPrompt()}
                    <View style={styles.pickerContainer}>
                        {this.renderPickers(this.state.optionLists)}
                    </View>
                    <View style={styles.buttonContainer}>
                        <View style={styles.buttonWrapper}>
                            <TouchableHighlight
                                style={[styles.button, styles.cancel, this.getOptionalStyle('cancel')]}
                                onPress={this.props.onCancel}
                                underlayColor={'lightgray'}
                            >
                                <Text allowFontScaling={this.props.allowFontScaling} style={styles.buttonText}>{this.props.cancelText}</Text>
                            </TouchableHighlight>
                        </View>
                        <View style={styles.buttonWrapper}>
                            <TouchableHighlight
                                onPress={this.handlePressDone}
                                style={[styles.button, styles.done, this.getOptionalStyle('done')]}
                                underlayColor={'lightgray'}
                            >
                                <Text allowFontScaling={this.props.allowFontScaling} style={styles.buttonText}>{this.props.doneText}</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

CustomPicker.propTypes = {
    /**
     * options
     *     An array of objects containing the information needed to populate each picker
     *     One picker will be rendered of each element of this array
     *     The `name` key is what is used to identify the final selection
     *     Final selections will be returned in an object with the key as this `name` and the value as the selected value
     */
    options: React.PropTypes.arrayOf(
        React.PropTypes.shape({
            name: React.PropTypes.string.isRequired,
            title: React.PropTypes.string,
            defaultLabel: React.PropTypes.string,
            bounds: React.PropTypes.arrayOf(React.PropTypes.number),
            options: React.PropTypes.arrayOf(
                React.PropTypes.shape({
                    label: React.PropTypes.string.isRequired,
                    value: React.PropTypes.oneOfType([
                        React.PropTypes.string,
                        React.PropTypes.number
                    ]).isRequired
                })
            )
        })
    ).isRequired,
    /**
     * onDone
     *     Callback function that will be passed the selections object when the user presses done
     */
    onDone: React.PropTypes.func.isRequired,
    /**
     * onCancel
     *     Callback function that will be called when the user presses cancel
     */
    onCancel: React.PropTypes.func.isRequired,
    /**
     * prompt
     *     Prompt text for the modal
     */
    prompt: React.PropTypes.string,
    /**
     * itemStyle
     *     Will be applied to iOS picker itemStyle prop
     */
    itemStyle: React.PropTypes.object,
    /**
     * doneText
     *     Text to display on the done button
     */
    doneText: React.PropTypes.string,
    /**
     * cancelText
     *     Text to display on the cancel button
     */
    cancelText: React.PropTypes.string,
    /**
     * padding
     *     Padding to be applied horizontally to the modal
     */
    padding: React.PropTypes.number,
    /**
     * borderWidth
     *     Border width of the modal
     */
    borderWidth: React.PropTypes.number,
    allowFontScaling: React.PropTypes.bool
};

CustomPicker.defaultProps = {
    doneText: 'Done',
    cancelText: 'Cancel',
    padding: 10,
    borderWidth: 1,
    itemStyle: {},
    style: {},
    allowFontScaling: true
};

const styles = StyleSheet.create({
    container: {
        width: WIN.width,
        height: WIN.height,
        position: 'absolute',
        top: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    popup: {
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 5,
        marginHorizontal: 5
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    pickerWrapper: {
    },
    listTitleWrapper: {
        paddingVertical: 5,
        backgroundColor: 'transparent'
    },
    listTitle: {
        textAlign: 'center'
    },
    promptWrapper: {
        paddingVertical: 5
    },
    prompt: {
        textAlign: 'center',
        fontWeight: '600'
    },
    buttonContainer: {
        flexDirection: 'row'
    },
    buttonWrapper: {
        flex: 1
    },
    button: {
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 5,
        padding: 5,
        marginVertical: 5,
    },
    buttonText: {
        textAlign: 'center',
    },
    cancel: {
        marginLeft: 10,
        marginRight: 5
    },
    done: {
        marginLeft: 5,
        marginRight: 10
    }
});
