// This component is memoized by the React Compiler
/* eslint-disable react/jsx-no-constructed-context-values */
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import RenderHTML from '@components/RenderHTML';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultDelegateNoAccessActionsContextValue, defaultDelegateNoAccessStateContextValue} from './default';
import type {DelegateNoAccessActionsContextType, DelegateNoAccessStateContextType} from './types';

const DelegateNoAccessStateContext = createContext<DelegateNoAccessStateContextType>(defaultDelegateNoAccessStateContextValue);
const DelegateNoAccessActionsContext = createContext<DelegateNoAccessActionsContextType>(defaultDelegateNoAccessActionsContextValue);

function DelegateNoAccessModalProvider({children}: PropsWithChildren) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const delegatorEmail = currentUserDetails?.login ?? '';
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    const isDelegateAccessRestricted = isActingAsDelegate && AccountUtils.isDelegateOnlySubmitter(account);

    const delegateNoAccessPrompt = useMemo(
        () => (
            <View style={[styles.renderHTML, styles.flexRow]}>
                <RenderHTML html={translate('delegate.notAllowedMessage', delegatorEmail)} />
            </View>
        ),
        [delegatorEmail, styles.flexRow, styles.renderHTML, translate],
    );

    const stateValue = useMemo(
        () => ({
            isActingAsDelegate,
            isDelegateAccessRestricted,
        }),
        [isActingAsDelegate, isDelegateAccessRestricted],
    );

    const showDelegateNoAccessModal = useCallback(() => setIsModalOpen(true), []);

    const actionsValue = useMemo(
        () => ({
            showDelegateNoAccessModal,
        }),
        [showDelegateNoAccessModal],
    );

    return (
        <DelegateNoAccessStateContext.Provider value={stateValue}>
            <DelegateNoAccessActionsContext.Provider value={actionsValue}>
                {children}
                <ConfirmModal
                    isVisible={isModalOpen}
                    onConfirm={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                    title={translate('delegate.notAllowed')}
                    prompt={delegateNoAccessPrompt}
                    confirmText={translate('common.buttonConfirm')}
                    shouldShowCancelButton={false}
                />
            </DelegateNoAccessActionsContext.Provider>
        </DelegateNoAccessStateContext.Provider>
    );
}

function useDelegateNoAccessState(): DelegateNoAccessStateContextType {
    return useContext(DelegateNoAccessStateContext);
}

function useDelegateNoAccessActions(): DelegateNoAccessActionsContextType {
    return useContext(DelegateNoAccessActionsContext);
}

export default DelegateNoAccessModalProvider;
export {useDelegateNoAccessState, useDelegateNoAccessActions};
