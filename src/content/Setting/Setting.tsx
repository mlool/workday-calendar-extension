import { useState } from 'react'
import './Setting.css'
import SettingInfoModal from './SettingInfoModal'
import InfoSquareIcon from '../Icons/InfoSquareIcon'
import DiscordIcon from '../Icons/DiscordIcon'

const autoFillInfo = <div>
    <p>Auto-fill automatically selects the "Start Date within" and "Academic Level" options in the "Find Course Sections" popup.</p>
    <br />
    <p>The extension will apply these selections to both terms in the currently selected session, and only for Undergraduate.</p>
</div>

const conflictAddingInfo = <div>
    <p>Enabling this option allows you to add sections that conflict with your existing schedule. This also applies when importing external schedules or copying from saved schedules.</p>
    <br />
    <p>Warning: Conflicting sections can make your calendar harder to read and may increase storage usage. Use this option with care.</p>
</div>

const Setting = () => {
    const [showInfoModal, setShowInfoModal] = useState<JSX.Element | null>(null)
    return (
        <div>
            {showInfoModal && <SettingInfoModal onClose={() => { setShowInfoModal(null) }} content={showInfoModal} />}
            <div>
                <div>
                    <label>Auto-fill</label>
                    <input type="checkbox" />
                </div>
                <InfoSquareIcon size={16} onClick={() => { setShowInfoModal(autoFillInfo) }} />
            </div>
            <div>
                <div>
                    <label>Conflict Adding</label>
                    <input type="checkbox" />
                </div>
                <InfoSquareIcon size={16} onClick={() => { setShowInfoModal(conflictAddingInfo) }} />
            </div>
            <div>
                <div>Support/Contact Us</div>
                <DiscordIcon size={32} />
            </div>
            <div>
                <div>Batch Export/Import</div>
            </div>
        </div>
    )
}

export default Setting