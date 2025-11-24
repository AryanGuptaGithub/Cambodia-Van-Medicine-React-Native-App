import {Platform} from 'react-native';
import SimpleToast from 'react-native-simple-toast';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = {
    show: (message) => {
        if (Platform.OS === 'web') {
            toast(message);
        } else {
            SimpleToast.show(message);
        }
    },
};

export default Toast;
