/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import * as api from './apiService';
import type { Customer, ConstructionSite, Order, SpecialOption, UploadedFile, SearchResult, User, OrderPart } from './apiService';


// --- Icon Components ---
const Icon: React.FC<{ path: string; className?: string }> = ({ path, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`icon ${className}`} fill="currentColor" width="1em" height="1em">
        <path d={path} />
    </svg>
);

const EditIcon = () => <Icon path="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />;
const DeleteIcon = () => <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />;
const ChevronIcon = () => <Icon path="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" className="chevron-icon"/>;
const ToggleStatusIcon = () => <Icon path="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1.5L19 6l-3.99-4v3H8v2h7.01v3z" />;
const NavigateIcon = () => <Icon path="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />;
const CloseIcon = () => <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />;
const CheckCircleIcon = () => <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />;
const HourglassIcon = () => <Icon path="M18 2H6v6l4 4-4 4v6h12v-6l-4-4 4-4V2zm-2 14.5V20H8v-3.5l4-4 4 4zM12 11.5l-4-4V4h8v3.5l-4 4z" />;
const PersonIcon = () => <Icon path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />;
const CommentIcon = () => <Icon path="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />;
const AddIcon = () => <Icon path="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />;
const BackArrowIcon = () => <Icon path="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />;
const DownloadIcon = () => <Icon path="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />;
const UploadIcon = () => <Icon path="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />;
const UsersIcon = () => <Icon path="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />;
const LogoutIcon = () => <Icon path="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />;
const SettingsIcon = () => <Icon path="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />;
const MenuIcon = () => <Icon path="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />;
const StarIcon = () => <Icon path="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />;
const VisibilityIcon = () => <Icon path="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />;
const VisibilityOffIcon = () => <Icon path="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />;


// --- Drag and Drop Hook ---
const useDragAndDrop = (onDropFiles: (files: FileList) => void) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragActive(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragActive(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        dragCounter.current = 0;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onDropFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };
    
    const getDropZoneProps = () => ({
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
    });

    return { isDragActive, getDropZoneProps };
};

// --- File URL Management Hook ---
const useFileUrls = (files: UploadedFile[]) => {
    const [urls, setUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        const fileUrls: { [key: string]: string } = {};

        const fetchUrls = async () => {
            const urlPromises = files.map(async (file) => {
                try {
                    const url = await api.getFileUrl(file.id);
                    if (url) {
                        return { id: file.id, url };
                    }
                } catch (error) {
                    console.error(`Error fetching URL for file ${file.id}:`, error);
                }
                return { id: file.id, url: null };
            });

            const results = await Promise.all(urlPromises);
            
            for (const result of results) {
                if(result.url) {
                    fileUrls[result.id] = result.url;
                }
            }
            setUrls(fileUrls);
        };

        if (files && files.length > 0) {
            fetchUrls();
        } else {
            setUrls({});
        }

        return () => {
            // When the component unmounts or files change, revoke the old URLs
            Object.values(fileUrls).forEach(URL.revokeObjectURL);
        };
    }, [files]); 

    return urls;
};


// --- Toast Notification Components ---
interface ToastMessage {
  id: number;
  message: string;
  type?: 'success' | 'error';
}

interface ToastProps {
    message: ToastMessage;
    onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(message.id);
        }, 3000); // Auto-dismiss after 3 seconds

        return () => clearTimeout(timer);
    }, [message.id, onDismiss]);

    return (
        <div className={`toast-item toast-${message.type || 'success'}`} onClick={() => onDismiss(message.id)}>
            {message.message}
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

// --- Dropdown Menu Component ---
interface DropdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    triggerRef: React.RefObject<HTMLElement>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, onClose, children, triggerRef }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    return (
        <div ref={menuRef} className="settings-dropdown-menu">
            <ul>{children}</ul>
        </div>
    );
};

interface DropdownItemProps {
    onClick: () => void;
    children: React.ReactNode;
}
const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, children }) => {
    return (
        <li className="dropdown-item" onClick={onClick}>
            {children}
        </li>
    );
};

// --- Slide Out Menu Component (Mobile) ---
interface SlideOutMenuProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const SlideOutMenu: React.FC<SlideOutMenuProps> = ({ isOpen, onClose, children }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Trap focus
            const focusableElements = menuRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements && focusableElements.length > 0) {
                 const firstElement = focusableElements[0];
                 const lastElement = focusableElements[focusableElements.length - 1];

                 const handleTabKeyPress = (e: KeyboardEvent) => {
                    if (e.key === 'Tab') {
                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                 };
                 
                 firstElement.focus();
                 document.addEventListener('keydown', handleTabKeyPress);

                 return () => {
                    document.removeEventListener('keydown', handleTabKeyPress);
                    document.removeEventListener('keydown', handleEscape);
                 }
            }
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    return (
        <>
            <div 
                className={`slide-out-menu-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />
            <div 
                ref={menuRef} 
                className={`slide-out-menu ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Main menu"
            >
                <div className="slide-out-menu-header">
                    <h3>Menu</h3>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer le menu"><CloseIcon /></button>
                </div>
                <ul className="slide-out-menu-list">{children}</ul>
            </div>
        </>
    );
};


// --- Site Panel Component ---
interface SitePanelProps {
    site: ConstructionSite;
    customerId: string;
    users: User[];
    isOpen: boolean;
    onToggle: () => void;
    onOpenInfoModal: () => void;
    onUpdateSiteName: (customerId: string, siteId: string, newName: string) => void;
    onAddOrder: (customerId: string, siteId: string, framesNumber: string, doorsNumber: string, userId: string) => void;
    onDeleteOrder: (customerId: string, siteId: string, orderId: string) => void;
    onToggleOrderStatus: (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors') => void;
    onUpdateOrderNumber: (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors', newNumber: string) => void;
    onUpdateOrderUser: (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors', userId: string) => void;
    onOpenNotesModal: (orderId: string, part: 'frames' | 'doors', number: string, notes: string) => void;
    onDeleteSite: (customerId: string, siteId: string) => void;
    currentUser: User;
    canEdit: boolean;
}

const SitePanel: React.FC<SitePanelProps> = ({ site, customerId, users, isOpen, onToggle, onOpenInfoModal, onUpdateSiteName, onAddOrder, onDeleteOrder, onToggleOrderStatus, onUpdateOrderNumber, onUpdateOrderUser, onOpenNotesModal, onDeleteSite, currentUser, canEdit }) => {
    const [newOrderNumber, setNewOrderNumber] = useState('');
    const [applyToFrames, setApplyToFrames] = useState(true);
    const [applyToDoors, setApplyToDoors] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(site.name);
    const [editingPart, setEditingPart] = useState<{ orderId: string; part: 'frames' | 'doors' } | null>(null);
    const [editingUser, setEditingUser] = useState<{ orderId: string; part: 'frames' | 'doors' } | null>(null);
    const [editedOrderNumber, setEditedOrderNumber] = useState('');
    const nameInputRef = useRef<HTMLInputElement>(null);
    const orderInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }
    }, [isEditing]);
    
    useEffect(() => {
        if (editingPart) {
            orderInputRef.current?.focus();
            orderInputRef.current?.select();
        }
    }, [editingPart]);
    
    useEffect(() => {
        // Reset edited name if the site name prop changes from outside
        setEditedName(site.name);
    }, [site.name]);


    const handleAddOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOrderNumber.trim() && (applyToFrames || applyToDoors)) {
            const framesNum = applyToFrames ? newOrderNumber.trim() : '';
            const doorsNum = applyToDoors ? newOrderNumber.trim() : '';
            onAddOrder(customerId, site.id, framesNum, doorsNum, currentUser.id);
            setNewOrderNumber('');
            setApplyToFrames(true);
            setApplyToDoors(true);
        }
    };
    
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the panel from toggling when deleting
        onDeleteSite(customerId, site.id);
    }
    
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent panel from toggling
        setIsEditing(true);
    };

    const handleInfoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenInfoModal();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedName(e.target.value);
    };
    
    const handleNameSave = () => {
        if (editedName.trim() && editedName.trim() !== site.name) {
            onUpdateSiteName(customerId, site.id, editedName.trim());
        }
        setIsEditing(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            setEditedName(site.name); // Revert changes
            setIsEditing(false);
        }
    };

    const handleOrderEditClick = (order: Order, part: 'frames' | 'doors') => {
        setEditingPart({ orderId: order.id, part });
        setEditedOrderNumber(order[part]!.number);
    };

    const handleOrderNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedOrderNumber(e.target.value);
    };

    const handleOrderNumberSave = () => {
        if (!editingPart) return;
        const { orderId, part } = editingPart;
        const originalOrder = site.orders.find(o => o.id === orderId);
        if (originalOrder && originalOrder[part] && editedOrderNumber.trim() && editedOrderNumber.trim() !== originalOrder[part]!.number) {
            onUpdateOrderNumber(customerId, site.id, orderId, part, editedOrderNumber.trim());
        }
        setEditingPart(null);
        setEditedOrderNumber('');
    };

    const handleOrderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleOrderNumberSave();
        } else if (e.key === 'Escape') {
            setEditingPart(null);
            setEditedOrderNumber('');
        }
    };
    
    const handleUserChange = (orderId: string, part: 'frames' | 'doors', newUserId: string) => {
        if (newUserId) {
            onUpdateOrderUser(customerId, site.id, orderId, part, newUserId);
        }
        setEditingUser(null);
    };

    const flattenedOrders = site.orders.flatMap(order => {
        const parts: { order: Order; part: 'frames' | 'doors'; partData: OrderPart }[] = [];
        if (order.frames) {
            parts.push({ order, part: 'frames', partData: order.frames });
        }
        if (order.doors) {
            parts.push({ order, part: 'doors', partData: order.doors });
        }
        return parts;
    }).sort((a, b) => new Date(b.partData.creationDate).getTime() - new Date(a.partData.creationDate).getTime());


    return (
        <div className={`site-panel ${isOpen ? 'open' : ''}`}>
            <div className="panel-header" onClick={onToggle} role="button" aria-expanded={isOpen}>
                {isEditing && canEdit ? (
                    <input
                        ref={nameInputRef}
                        type="text"
                        value={editedName}
                        onChange={handleNameChange}
                        onBlur={handleNameSave}
                        onKeyDown={handleNameKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="site-name-edit"
                        aria-label="Modifier le nom du chantier"
                    />
                ) : (
                    <h3>{site.name}</h3>
                )}
                <div className="panel-actions">
                  <button onClick={handleInfoClick} className="info-btn-header" aria-label={`Afficher les informations générales pour ${site.name}`}>infos générales</button>
                  {canEdit && (
                    <>
                        <button onClick={handleEditClick} className="edit-btn" aria-label={`Modifier le nom du chantier ${site.name}`}><EditIcon /></button>
                        <button onClick={handleDeleteClick} className="delete-btn card-delete-btn" aria-label={`Supprimer le chantier ${site.name}`}><DeleteIcon /></button>
                    </>
                  )}
                  <ChevronIcon />
                </div>
            </div>
            <div className="panel-body">
                <div className="panel-content">
                    {canEdit && (
                        <>
                            <h5>Numéros de Commande</h5>
                            <form onSubmit={handleAddOrder} className="add-form add-order-form">
                                <div className="order-input-group">
                                    <input
                                        type="text"
                                        value={newOrderNumber}
                                        onChange={(e) => setNewOrderNumber(e.target.value)}
                                        placeholder="N° Commande"
                                        aria-label="Nouveau numéro de commande"
                                    />
                                </div>
                                 <div className="order-user-display">
                                    <PersonIcon />
                                    <span>Assigné à: <strong>{currentUser.name}</strong></span>
                                </div>
                                <div className="order-checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={applyToFrames}
                                            onChange={(e) => setApplyToFrames(e.target.checked)}
                                        />
                                        Huisseries
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={applyToDoors}
                                            onChange={(e) => setApplyToDoors(e.target.checked)}
                                        />
                                        Portes
                                    </label>
                                </div>
                                <button type="submit" disabled={!newOrderNumber.trim()}>Ajouter</button>
                            </form>
                        </>
                    )}

                    <div className="orders-table-container">
                        {flattenedOrders.length === 0 ? (
                            <div className="no-orders">Aucune commande pour l'instant.</div>
                        ) : (
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>N° Commande</th>
                                        <th>Assigné à</th>
                                        <th>Date</th>
                                        <th>Statut</th>
                                        <th className="actions-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flattenedOrders.map(({ order, part, partData }) => {
                                        const isEditingThisPart = editingPart?.orderId === order.id && editingPart?.part === part;
                                        const isEditingThisUser = editingUser?.orderId === order.id && editingUser?.part === part;
                                        const formattedDate = new Date(partData.creationDate).toLocaleDateString('fr-FR', {
                                            day: '2-digit', month: '2-digit', year: 'numeric'
                                        });

                                        return (
                                            <tr key={`${order.id}-${part}`}>
                                                <td>
                                                    <span className={`type-badge type-${part}`}>
                                                        {part === 'frames' ? 'Huisseries' : 'Portes'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {isEditingThisPart && canEdit ? (
                                                        <input
                                                            ref={orderInputRef}
                                                            type="text"
                                                            value={editedOrderNumber}
                                                            onChange={handleOrderNumberChange}
                                                            onBlur={handleOrderNumberSave}
                                                            onKeyDown={handleOrderKeyDown}
                                                            className="order-number-edit"
                                                            aria-label={`Modifier le numéro de commande pour ${part}`}
                                                        />
                                                    ) : (
                                                        <span className="order-number">{partData.number}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditingThisUser && canEdit ? (
                                                        <select
                                                            value={partData.userId}
                                                            onChange={(e) => handleUserChange(order.id, part, e.target.value)}
                                                            onBlur={() => setEditingUser(null)}
                                                            autoFocus
                                                            className="order-user-select"
                                                        >
                                                            {users.map(user => (
                                                                <option key={user.id} value={user.id}>{user.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className={`order-user-info ${canEdit ? 'editable' : ''}`} onClick={() => canEdit && setEditingUser({orderId: order.id, part})}>
                                                            <PersonIcon />
                                                            {partData.userName}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="order-date">{formattedDate}</span>
                                                </td>
                                                <td>
                                                    <span className={`status ${partData.isSent ? 'status-sent' : 'status-pending'}`}>
                                                        {partData.isSent ? <CheckCircleIcon /> : <HourglassIcon />}
                                                        {partData.isSent ? 'Envoyée' : 'En attente'}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button 
                                                        onClick={() => onOpenNotesModal(order.id, part, partData.number, partData.notes || '')}
                                                        className="notes-btn" 
                                                        aria-label="Afficher/Masquer les notes"
                                                        title="Notes"
                                                    >
                                                        <CommentIcon />
                                                    </button>
                                                    {canEdit && (
                                                        <>
                                                            <button onClick={() => handleOrderEditClick(order, part)} className="edit-btn" aria-label={`Modifier la commande ${partData.number}`} title="Modifier"><EditIcon /></button>
                                                            <button
                                                                onClick={() => onToggleOrderStatus(customerId, site.id, order.id, part)}
                                                                className="toggle-btn"
                                                                aria-label={`Changer le statut de la commande ${partData.number}`}
                                                                title="Changer Statut"
                                                            >
                                                                <ToggleStatusIcon />
                                                            </button>
                                                             <button onClick={() => onDeleteOrder(customerId, site.id, order.id)} className="delete-btn" aria-label={`Supprimer la commande`} title="Supprimer"><DeleteIcon /></button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Pending Orders Modal Component ---
interface PendingOrderPart {
    orderId: string;
    part: 'frames' | 'doors';
    number: string;
    customerName: string;
    customerId: string;
    siteName: string;
    siteId: string;
    creationDate: string;
    userId: string;
}

interface PendingOrdersModalProps {
    orders: PendingOrderPart[];
    users: User[];
    onClose: () => void;
    onToggleStatus: (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors') => void;
    onNavigate: (customerId: string, siteId: string) => void;
    canEdit: boolean;
}

const PendingOrdersModal: React.FC<PendingOrdersModalProps> = ({ orders, users, onClose, onToggleStatus, onNavigate, canEdit }) => {
    const [selectedUserIdFilter, setSelectedUserIdFilter] = useState('all');

    const filteredOrders = orders.filter(order =>
        selectedUserIdFilter === 'all' || order.userId === selectedUserIdFilter
    );

    const handleSendEmail = () => {
        const subject = "Récapitulatif des Commandes en Attente";

        // Group orders by customer, then by site
        const groupedOrders = filteredOrders.reduce((acc, order) => {
            if (!acc[order.customerName]) {
                acc[order.customerName] = {};
            }
            if (!acc[order.customerName][order.siteName]) {
                acc[order.customerName][order.siteName] = [];
            }
            acc[order.customerName][order.siteName].push(order);
            return acc;
        }, {} as Record<string, Record<string, PendingOrderPart[]>>);

        let body = "Bonjour,\n\nVoici la liste des commandes actuellement en attente :\n\n---\n\n";

        for (const customerName in groupedOrders) {
            body += `**Client: ${customerName}**\n\n`;
            for (const siteName in groupedOrders[customerName]) {
                body += `  *Chantier: ${siteName}*\n`;
                groupedOrders[customerName][siteName].forEach(order => {
                    const formattedDate = new Date(order.creationDate).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });
                    const partName = order.part === 'frames' ? 'Huisseries' : 'Portes';
                    body += `    - ${order.number} (${partName}) - Créée le ${formattedDate}\n`;
                });
                body += '\n';
            }
            body += '---\n\n';
        }
        
        body += "Cordialement,\nL'équipe Batiserv";

        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Commandes en Attente</h2>
                    <div className="pending-orders-filter">
                        <label htmlFor="user-filter">Filtrer par:</label>
                        <select
                            id="user-filter"
                            value={selectedUserIdFilter}
                            onChange={e => setSelectedUserIdFilter(e.target.value)}
                        >
                            <option value="all">Tous les utilisateurs</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    {filteredOrders.length === 0 ? (
                        <p className="no-pending-orders">
                            {selectedUserIdFilter === 'all'
                                ? "Aucune commande en attente."
                                : "Aucune commande en attente pour l'utilisateur sélectionné."
                            }
                        </p>
                    ) : (
                        <ul className="pending-orders-list">
                            {filteredOrders.map(orderPart => (
                                <li key={`${orderPart.orderId}-${orderPart.part}`}>
                                    <div className="order-info">
                                        <span className="order-number-modal">
                                            <HourglassIcon />
                                            {orderPart.number}
                                            <span className="part-label-modal">({orderPart.part === 'frames' ? 'Huisseries' : 'Portes'})</span>
                                        </span>
                                        <span className="order-context">{orderPart.customerName} / {orderPart.siteName}</span>
                                    </div>
                                    <div className="order-actions">
                                        <button onClick={() => onNavigate(orderPart.customerId, orderPart.siteId)} className="navigate-btn" title="Aller au chantier"><NavigateIcon /></button>
                                        {canEdit && <button onClick={() => onToggleStatus(orderPart.customerId, orderPart.siteId, orderPart.orderId, orderPart.part)} className="mark-sent-btn">Marquer comme Envoyée</button>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {canEdit && (
                    <div className="modal-footer pending-orders-footer">
                        <button onClick={handleSendEmail} className="email-btn" disabled={filteredOrders.length === 0}>
                            Envoyer par Email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Users Modal Component ---
interface UsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    currentUser: User;
    onAddUser: (name: string, email: string, password: string, role: User['role']) => Promise<void>;
    onDeleteUser: (userId: string) => void;
    onEditUser: (user: User) => void;
}

const UsersModal: React.FC<UsersModalProps> = ({ isOpen, onClose, users, currentUser, onAddUser, onDeleteUser, onEditUser }) => {
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<User['role']>('Viewer');

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newUserName.trim() && newUserEmail.trim() && newPassword.trim()) {
            await onAddUser(newUserName.trim(), newUserEmail.trim(), newPassword.trim(), newUserRole);
            setNewUserName('');
            setNewUserEmail('');
            setNewPassword('');
            setNewUserRole('Viewer');
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content users-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Gérer les Utilisateurs</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleAddUser} className="add-form add-user-form">
                        <input
                            type="text"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Nom d'utilisateur"
                            aria-label="Nom du nouvel utilisateur"
                            required
                        />
                         <input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="Email"
                            aria-label="Email du nouvel utilisateur"
                            required
                        />
                         <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mot de passe"
                            aria-label="Mot de passe du nouvel utilisateur"
                            required
                        />
                        <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as User['role'])}
                            aria-label="Rôle du nouvel utilisateur"
                        >
                            <option value="Admin">Admin</option>
                            <option value="Editor">Éditeur</option>
                            <option value="Viewer">Lecteur</option>
                        </select>
                        <button type="submit">Ajouter</button>
                    </form>
                    <ul className="users-list">
                        {users.length === 0 ? (
                             <li className="no-users-placeholder">Aucun utilisateur.</li>
                        ) : (
                            users.map(user => (
                                <li key={user.id}>
                                    <div className="user-info-col">
                                        <span className="user-name">{user.name}</span>
                                        <span className="user-email">{user.email}</span>
                                    </div>
                                    <div className="user-role-management">
                                        <span className={`role-badge role-${user.role}`}>{user.role}</span>
                                        <button onClick={() => onEditUser(user)} className="edit-btn" aria-label={`Modifier ${user.name}`} title="Modifier"><EditIcon /></button>
                                        {user.id !== currentUser.id && (
                                            <button onClick={() => onDeleteUser(user.id)} className="delete-btn" aria-label={`Supprimer ${user.name}`} title="Supprimer"><DeleteIcon /></button>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- User Profile Modal Component ---
interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit: User | null;
    currentUser: User;
    users: User[];
    onSave: (userId: string, updates: Partial<{ name: string; email: string; password?: string; role: User['role'] }>) => void;
    addToast: (message: string, type?: 'success' | 'error') => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userToEdit, currentUser, users, onSave, addToast }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<User['role']>('Viewer');
    const nameInputRef = useRef<HTMLInputElement>(null);

    const isEditingSelf = userToEdit?.id === currentUser.id;
    const isAdmin = currentUser.role === 'Admin';
    
    useEffect(() => {
        if (isOpen && userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setRole(userToEdit.role);
            setPassword('');
            setConfirmPassword('');
             // Focus the input when the modal opens
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [isOpen, userToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;

        if (password && password !== confirmPassword) {
            addToast("Les mots de passe ne correspondent pas.", 'error');
            return;
        }

        const updates: Partial<{ name: string; email:string; password?: string; role: User['role'] }> = {};

        if (name.trim() !== userToEdit.name) {
            updates.name = name.trim();
        }
        if (email.trim() !== userToEdit.email) {
            updates.email = email.trim();
        }
        if (password) {
            updates.password = password;
        }
        if (isAdmin && role !== userToEdit.role) {
            updates.role = role;
        }

        if (Object.keys(updates).length > 0) {
            onSave(userToEdit.id, updates);
        } else {
            onClose(); // Close if no changes were made
        }
    };

    if (!isOpen || !userToEdit) return null;

    return (
         <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditingSelf ? "Modifier Mon Profil" : `Modifier le Profil de ${userToEdit.name}`}</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="profile-name">Nom d'utilisateur</label>
                            <input
                                id="profile-name"
                                ref={nameInputRef}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile-email">Email</label>
                            <input
                                id="profile-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="profile-password">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                            <input
                                id="profile-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nouveau mot de passe"
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="profile-confirm-password">Confirmer le mot de passe</label>
                            <input
                                id="profile-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmer le mot de passe"
                                disabled={!password}
                            />
                        </div>
                        {isAdmin && (
                            <div className="form-group">
                                <label htmlFor="profile-role">Rôle</label>
                                <select
                                    id="profile-role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as User['role'])}
                                    // An admin cannot demote themselves if they are the last admin
                                    disabled={isEditingSelf && role === 'Admin' && users.filter(u => u.role === 'Admin').length <= 1}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Editor">Éditeur</option>
                                    <option value="Viewer">Lecteur</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="cancel-btn">Annuler</button>
                        <button type="submit" className="confirm-btn" disabled={!name.trim() || !email.trim()}>
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Special Options Components ---
interface SpecialOptionPanelProps {
    option: SpecialOption;
    isOpen: boolean;
    onToggle: () => void;
    onDelete: (optionId: string) => void;
    onUpdate: (optionId: string, updates: Partial<Pick<SpecialOption, 'name' | 'details'>>) => void;
    onAddFile: (optionId: string, file: File) => void;
    onDeleteFile: (optionId: string, fileId: string) => void;
    canEdit: boolean;
}

const SpecialOptionPanel: React.FC<SpecialOptionPanelProps> = ({ option, isOpen, onToggle, onDelete, onUpdate, onAddFile, onDeleteFile, canEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(option.name);
    const [details, setDetails] = useState(option.details);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const detailsTextareaRef = useRef<HTMLTextAreaElement>(null);
    const fileUrls = useFileUrls(option.files);

    const handleFilesDropped = (files: FileList) => {
        for (const file of Array.from(files)) {
            onAddFile(option.id, file);
        }
    };

    const { isDragActive, getDropZoneProps } = useDragAndDrop(handleFilesDropped);

    useEffect(() => {
        setEditedName(option.name);
    }, [option.name]);
    
    useEffect(() => {
        if (isEditing) {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }
    }, [isEditing]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = detailsTextareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [details]);
    
    // Debounce the details update
    useEffect(() => {
        const handler = setTimeout(() => {
            if (canEdit && details !== option.details) {
                onUpdate(option.id, { details });
            }
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(handler);
    }, [details, option.id, option.details, onUpdate, canEdit]);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleNameSave = () => {
        if (editedName.trim() && editedName.trim() !== option.name) {
            onUpdate(option.id, { name: editedName.trim() });
        }
        setIsEditing(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleNameSave();
        else if (e.key === 'Escape') {
            setEditedName(option.name);
            setIsEditing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        for (let i = 0; i < files.length; i++) {
            onAddFile(option.id, files[i]);
        }
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`site-panel special-option-panel ${isOpen ? 'open' : ''}`}>
            <div className="panel-header" onClick={onToggle} role="button" aria-expanded={isOpen}>
                 {isEditing && canEdit ? (
                    <input
                        ref={nameInputRef}
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={handleNameKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="site-name-edit"
                        aria-label="Modifier le nom de l'option"
                    />
                ) : (
                    <h3>{option.name}</h3>
                )}
                {canEdit && (
                    <div className="panel-actions">
                      <button onClick={handleEditClick} className="edit-btn" aria-label={`Modifier le nom de l'option ${option.name}`}><EditIcon /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(option.id); }} className="delete-btn card-delete-btn" aria-label={`Supprimer l'option ${option.name}`}><DeleteIcon /></button>
                      <ChevronIcon />
                    </div>
                )}
            </div>
            <div className="panel-body">
                <div className="panel-content">
                    <h5>Détails</h5>
                    <textarea
                        ref={detailsTextareaRef}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Ajoutez des détails sur cette option..."
                        aria-label="Détails de l'option"
                        rows={1}
                        readOnly={!canEdit}
                    />
                    <h5>Fichiers</h5>
                    {canEdit && (
                        <div
                            {...getDropZoneProps()}
                            className={`file-upload-area ${isDragActive ? 'drag-active' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                           <input
                                type="file"
                                id={`file-upload-${option.id}`}
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                multiple
                            />
                            <div className="file-input-placeholder">
                                <UploadIcon />
                                <span>{isDragActive ? "Déposez les fichiers ici" : "Glissez-déposez ou cliquez pour téléverser"}</span>
                            </div>
                        </div>
                    )}
                     <ul className="file-list">
                        {option.files.length === 0 && <li className="no-files">Aucun fichier téléversé.</li>}
                        {option.files.map(file => (
                            <li key={file.id}>
                                <a href={fileUrls[file.id] || '#'} download={file.name} target="_blank" rel="noopener noreferrer" className="file-name" title={file.name}>{file.name}</a>
                                {canEdit && <button onClick={() => onDeleteFile(option.id, file.id)} className="delete-btn file-delete-btn" aria-label={`Supprimer le fichier ${file.name}`}><DeleteIcon /></button>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

interface SpecialOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    options: SpecialOption[];
    onAddOption: (name: string) => void;
    onDeleteOption: (optionId: string) => void;
    onUpdateOption: (optionId: string, updates: Partial<Pick<SpecialOption, 'name' | 'details'>>) => void;
    onAddFile: (optionId: string, file: File) => void;
    onDeleteFile: (optionId: string, fileId: string) => void;
    initialOpenOptionId?: string | null;
    canEdit: boolean;
}

const SpecialOptionsModal: React.FC<SpecialOptionsModalProps> = ({ isOpen, onClose, options, onAddOption, initialOpenOptionId, canEdit, ...rest }) => {
    const [newOptionName, setNewOptionName] = useState('');
    const [openOptionId, setOpenOptionId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && initialOpenOptionId) {
            setOpenOptionId(initialOpenOptionId);
        }
    }, [isOpen, initialOpenOptionId]);

    const handleAddOption = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOptionName.trim()) {
            onAddOption(newOptionName.trim());
            setNewOptionName('');
        }
    };

    const handleToggleOption = (optionId: string) => {
        setOpenOptionId(prev => (prev === optionId ? null : optionId));
    };
    
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Options Spéciales</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    {canEdit && (
                        <form onSubmit={handleAddOption} className="add-form">
                            <input
                                type="text"
                                value={newOptionName}
                                onChange={(e) => setNewOptionName(e.target.value)}
                                placeholder="Nom de la nouvelle option"
                                aria-label="Nom de la nouvelle option"
                            />
                            <button type="submit">Ajouter l'Option</button>
                        </form>
                    )}
                    <div className="options-list">
                        {options.length === 0 ? (
                            <p className="no-options-placeholder">Aucune option spéciale pour l'instant. Ajoutez-en une ci-dessus pour commencer.</p>
                        ) : (
                            options.map(option => (
                                <SpecialOptionPanel
                                    key={option.id}
                                    option={option}
                                    isOpen={openOptionId === option.id}
                                    onToggle={() => handleToggleOption(option.id)}
                                    onDelete={rest.onDeleteOption}
                                    onUpdate={rest.onUpdateOption}
                                    onAddFile={rest.onAddFile}
                                    onDeleteFile={rest.onDeleteFile}
                                    canEdit={canEdit}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Confirmation Modal Component ---
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content confirmation-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-btn">Annuler</button>
                    <button onClick={onConfirm} className="confirm-btn-danger">Confirmer</button>
                </div>
            </div>
        </div>
    );
};

// --- General Info Modal Component ---
interface GeneralInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    siteName: string;
    generalInfo: string;
    files: UploadedFile[];
    onSave: (newInfo: string) => void;
    onAddFile: (file: File) => void;
    onDeleteFile: (fileId: string) => void;
    canEdit: boolean;
}

const GeneralInfoModal: React.FC<GeneralInfoModalProps> = ({ isOpen, onClose, siteName, generalInfo, files, onSave, onAddFile, onDeleteFile, canEdit }) => {
    const [editedInfo, setEditedInfo] = useState(generalInfo);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileUrls = useFileUrls(files);

    const handleFilesDropped = (files: FileList) => {
        for (const file of Array.from(files)) {
            onAddFile(file);
        }
    };

    const { isDragActive, getDropZoneProps } = useDragAndDrop(handleFilesDropped);

    useEffect(() => {
        setEditedInfo(generalInfo);
    }, [generalInfo, isOpen]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [editedInfo]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        for (let i = 0; i < files.length; i++) {
            onAddFile(files[i]);
        }
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(editedInfo);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Informations pour {siteName}</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <h5>Notes Générales</h5>
                    <textarea
                        ref={textareaRef}
                        className="general-info-textarea"
                        value={editedInfo}
                        onChange={(e) => setEditedInfo(e.target.value)}
                        placeholder="Ajoutez des notes sur le chantier..."
                        aria-label="Informations générales pour le chantier"
                        rows={10}
                        autoFocus
                        readOnly={!canEdit}
                    />
                    <h5 style={{ marginTop: '1.5rem' }}>Fichiers</h5>
                     {canEdit && (
                        <div
                            {...getDropZoneProps()}
                            className={`file-upload-area ${isDragActive ? 'drag-active' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                           <input
                                type="file"
                                id={`file-upload-general-${siteName.replace(/\s/g, '-')}`}
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                multiple
                            />
                            <div className="file-input-placeholder">
                                <UploadIcon />
                                <span>{isDragActive ? "Déposez les fichiers ici" : "Glissez-déposez ou cliquez pour téléverser"}</span>
                            </div>
                        </div>
                    )}
                     <ul className="file-list">
                        {(!files || files.length === 0) && <li className="no-files">Aucun fichier téléversé.</li>}
                        {files && files.map(file => (
                            <li key={file.id}>
                                <a href={fileUrls[file.id] || '#'} download={file.name} target="_blank" rel="noopener noreferrer" className="file-name" title={file.name}>{file.name}</a>
                                {canEdit && <button onClick={() => onDeleteFile(file.id)} className="delete-btn file-delete-btn" aria-label={`Supprimer le fichier ${file.name}`}><DeleteIcon /></button>}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-btn">Fermer</button>
                    {canEdit && <button onClick={handleSave} className="confirm-btn">Enregistrer les Notes</button>}
                </div>
            </div>
        </div>
    );
};

// --- Order Notes Modal Component ---
interface OrderNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newNotes: string) => void;
    orderNumber: string;
    partName: string;
    initialNotes: string;
    canEdit: boolean;
}

const OrderNotesModal: React.FC<OrderNotesModalProps> = ({ isOpen, onClose, onSave, orderNumber, partName, initialNotes, canEdit }) => {
    const [editedNotes, setEditedNotes] = useState(initialNotes);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setEditedNotes(initialNotes);
        }
    }, [initialNotes, isOpen]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [editedNotes]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(editedNotes);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Notes pour {partName} {orderNumber}</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <textarea
                        ref={textareaRef}
                        className="general-info-textarea"
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Ajouter des notes..."
                        aria-label={`Notes pour ${partName} ${orderNumber}`}
                        rows={8}
                        autoFocus
                        readOnly={!canEdit}
                    />
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-btn">Annuler</button>
                    {canEdit && <button onClick={handleSave} className="confirm-btn">Enregistrer</button>}
                </div>
            </div>
        </div>
    );
};

// --- Customer Notes Modal Component ---
interface CustomerNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newNotes: string) => void;
    customerName: string;
    initialNotes: string;
    canEdit: boolean;
}

const CustomerNotesModal: React.FC<CustomerNotesModalProps> = ({ isOpen, onClose, onSave, customerName, initialNotes, canEdit }) => {
    const [editedNotes, setEditedNotes] = useState(initialNotes);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setEditedNotes(initialNotes);
        }
    }, [initialNotes, isOpen]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [editedNotes]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(editedNotes);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Notes pour le client {customerName}</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <textarea
                        ref={textareaRef}
                        className="general-info-textarea"
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Ajouter des notes sur le client..."
                        aria-label={`Notes pour le client ${customerName}`}
                        rows={8}
                        autoFocus
                        readOnly={!canEdit}
                    />
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-btn">Annuler</button>
                    {canEdit && <button onClick={handleSave} className="confirm-btn">Enregistrer</button>}
                </div>
            </div>
        </div>
    );
};

// --- Add Customer Modal Component ---
interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string) => Promise<void>;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [newCustomerName, setNewCustomerName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus the input when the modal opens, with a slight delay to ensure it's rendered
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCustomerName.trim()) {
            await onAdd(newCustomerName.trim());
            setNewCustomerName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Ajouter un Nouveau Client</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer la fenêtre"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <label htmlFor="new-customer-name-input" className="form-label">Nom du Client</label>
                        <input
                            id="new-customer-name-input"
                            ref={inputRef}
                            type="text"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            placeholder="Entrez le nom du client"
                            aria-label="Nom du nouveau client"
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="cancel-btn">Annuler</button>
                        <button type="submit" className="confirm-btn" disabled={!newCustomerName.trim()}>
                            Ajouter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Export Data Modal Component ---
interface ExportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers: Customer[];
    onExport: (customerIds: string[]) => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose, customers, onExport }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(customers.map(c => c.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleToggleCustomer = (customerId: string) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(customerId)) {
            newSelectedIds.delete(customerId);
        } else {
            newSelectedIds.add(customerId);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleExportClick = () => {
        onExport(Array.from(selectedIds));
    };
    
    if (!isOpen) return null;
    
    const allSelected = selectedIds.size === customers.length && customers.length > 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content export-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Exporter les Données Client</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Fermer"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <p className="export-description">Sélectionnez les clients que vous souhaitez inclure dans l'exportation CSV.</p>
                    <div className="export-customer-list">
                        <div className="export-list-header">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={handleToggleAll}
                                    disabled={customers.length === 0}
                                />
                                Tout sélectionner
                            </label>
                        </div>
                        <ul>
                            {customers.length > 0 ? customers.map(customer => (
                                <li key={customer.id}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(customer.id)}
                                            onChange={() => handleToggleCustomer(customer.id)}
                                        />
                                        {customer.name}
                                    </label>
                                </li>
                            )) : <li className="no-customers-export">Aucun client à exporter.</li>}
                        </ul>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-btn">Annuler</button>
                    <button onClick={handleExportClick} className="confirm-btn" disabled={selectedIds.size === 0}>
                        Exporter ({selectedIds.size})
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Import Data Modal Component ---
interface ImportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (csvString: string) => Promise<void>;
    addToast: (message: string, type?: 'success' | 'error') => void;
}

const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, onImport, addToast }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
            } else {
                setFile(null);
                addToast('Veuillez sélectionner un fichier CSV valide.', 'error');
            }
        }
    };
    
    const handleReset = () => {
        setFile(null);
        setIsProcessing(false);
        if(fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    const handleImportClick = () => {
        if (!file) return;
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvContent = event.target?.result as string;
            await onImport(csvContent);
            // The parent component will handle closing on success
            setIsProcessing(false); // Reset processing state regardless
        };
        reader.onerror = () => {
            addToast("Erreur lors de la lecture du fichier.", 'error');
            setIsProcessing(false);
        };
        reader.readAsText(file, 'UTF-8');
    };
    
    const handleFilesDropped = (files: FileList) => {
        if (files.length > 0) {
            const firstFile = files[0];
            if (firstFile.type === 'text/csv' || firstFile.name.endsWith('.csv')) {
                setFile(firstFile);
            } else {
                setFile(null);
                addToast('Veuillez déposer un fichier CSV valide.', 'error');
            }
        }
    };
    const { isDragActive, getDropZoneProps } = useDragAndDrop(handleFilesDropped);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleReset}>
            <div className="modal-content import-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Importer des Données</h2>
                    <button onClick={handleReset} className="close-btn" aria-label="Fermer"><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <div className="import-instructions">
                        <h5>Format du Fichier CSV</h5>
                        <p>Le fichier doit être un CSV avec les en-têtes suivants. L'ordre est important. Les colonnes obligatoires sont marquées d'un *.</p>
                        <ul>
                            <li><code>CustomerName</code> *</li>
                            <li><code>CustomerNotes</code></li>
                            <li><code>SiteName</code> * (si une commande est présente)</li>
                            <li><code>SiteGeneralInfo</code></li>
                            <li><code>OrderPart</code> * (Doit être 'Huisseries' ou 'Portes')</li>
                            <li><code>OrderNumber</code> *</li>
                            <li><code>OrderAssignedUser</code> *</li>
                            <li><code>UserRole</code> (Optionnel: 'Admin', 'Editor', ou 'Viewer'. 'Viewer' par défaut)</li>
                            <li><code>OrderStatus</code> (Optionnel, 'Envoyée' ou laisser vide)</li>
                            <li><code>OrderNotes</code></li>
                            <li><code>OrderCreationDate</code> (Optionnel, format `jj/mm/aaaa hh:mm:ss`)</li>
                        </ul>
                        <p><strong>Note :</strong> L'importation ajoutera de nouvelles données. Elle ne mettra pas à jour les clients, chantiers ou commandes existants portant le même nom pour éviter les conflits.</p>
                    </div>
                    <div
                        {...getDropZoneProps()}
                        className={`file-input-wrapper ${isDragActive ? 'drag-active' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                         <input
                            id="csv-file-input"
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        {file ? (
                           <div className="file-name-display">
                                <CheckCircleIcon /> {file.name}
                            </div>
                        ) : (
                           <div className="file-input-placeholder">
                                <UploadIcon />
                                <span>{isDragActive ? "Déposez le fichier ici" : "Cliquez ou déposez un fichier CSV ici"}</span>
                           </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleReset} className="cancel-btn">Annuler</button>
                    <button onClick={handleImportClick} className="confirm-btn" disabled={!file || isProcessing}>
                        {isProcessing ? (
                            <>
                                Traitement...
                                <span className="processing-loader"></span>
                            </>
                        ) : "Importer le Fichier"}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Splash Screen Component ---
interface SplashScreenProps {
  isOpening: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isOpening }) => {
  return (
    <div className={`splash-screen ${isOpening ? 'opening' : ''}`}>
      <div className="door left-door">
        <div className="door-content">
          <h1>BATI</h1>
        </div>
      </div>
      <div className="door right-door">
        <div className="door-content">
          <h1>SERV</h1>
        </div>
      </div>
    </div>
  );
};

// --- Loader Component ---
const Loader: React.FC = () => (
    <div className="loader-container">
        <div className="loader"></div>
    </div>
);


// --- Login Screen Component ---
interface LoginScreenProps {
    onLoginSuccess: (user: User) => void;
    onNavigateToSignup: () => void;
    onNavigateToRecover: () => void;
    
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToSignup, onNavigateToRecover }) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const user = await api.login(usernameOrEmail, password);
            onLoginSuccess(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-screen-container">
            <div className="login-form-wrapper">
                <img src="https://i.ibb.co/Z1vqcYCj/Batiserv-1-1.png" alt="Batiserv Logo" className="login-logo" />
                <form onSubmit={handleSubmit} className="login-form">
                    <h2>Connexion</h2>
                    {error && <p className="login-error">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="username">Nom d'utilisateur ou Email</label>
                        <input
                            type="text"
                            id="username"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <div className="password-input-wrapper">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                             <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setIsPasswordVisible(prev => !prev)}
                                aria-label={isPasswordVisible ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                            >
                                {isPasswordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </button>
                    <div className="login-links">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRecover(); }}>Mot de passe oublié ?</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToSignup(); }}>Créer un compte</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Sign Up Screen Component ---
interface SignUpScreenProps {
    onNavigateToLogin: () => void;
    onSignupSuccess: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToLogin, onSignupSuccess }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await api.signup(username, email, password);
            onSignupSuccess(); // Navigate back to login with a success message
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-screen-container">
            <div className="login-form-wrapper">
                <img src="https://i.ibb.co/Z1vqcYCj/Batiserv-1-1.png" alt="Batiserv Logo" className="login-logo" />
                <form onSubmit={handleSubmit} className="login-form">
                    <h2>Créer un Compte</h2>
                    {error && <p className="login-error">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="signup-username">Nom d'utilisateur</label>
                        <input
                            type="text"
                            id="signup-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                     <div className="form-group">
                        <label htmlFor="signup-email">Email</label>
                        <input
                            type="email"
                            id="signup-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signup-password">Mot de passe</label>
                        <input
                            type="password"
                            id="signup-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                     <div className="form-group">
                        <label htmlFor="signup-confirm-password">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            id="signup-confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? 'Création...' : "S'inscrire"}
                    </button>
                    <div className="login-links">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}>Retour à la connexion</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Recover Password Screen ---
interface RecoverPasswordScreenProps {
    onNavigateToLogin: () => void;
}

const RecoverPasswordScreen: React.FC<RecoverPasswordScreenProps> = ({ onNavigateToLogin }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await api.recoverPassword(email);
            setSuccessMessage("Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.");
        } catch (err) {
            // In a real app, you might not want to reveal if an email exists
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-screen-container">
            <div className="login-form-wrapper">
                <img src="https://i.ibb.co/Z1vqcYCj/Batiserv-1-1.png" alt="Batiserv Logo" className="login-logo" />
                <form onSubmit={handleSubmit} className="login-form">
                    <h2>Récupérer le Mot de Passe</h2>
                    {error && <p className="login-error">{error}</p>}
                    {successMessage ? (
                         <p className="login-success">{successMessage}</p>
                    ) : (
                        <>
                             <p className="form-description">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                            <div className="form-group">
                                <label htmlFor="recover-email">Email</label>
                                <input
                                    type="email"
                                    id="recover-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="login-btn" disabled={isLoading}>
                                {isLoading ? 'Envoi...' : "Envoyer"}
                            </button>
                        </>
                    )}
                    <div className="login-links">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}>Retour à la connexion</a>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Application Component ---
interface AppProps {
  currentUser: User;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

const App: React.FC<AppProps> = ({ currentUser, onLogout, onUserUpdate }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [specialOptions, setSpecialOptions] = useState<SpecialOption[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSiteNames, setNewSiteNames] = useState<{[key: string]: string}>({});
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [openSiteId, setOpenSiteId] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editedCustomerName, setEditedCustomerName] = useState('');
  const [isPendingOrdersModalOpen, setIsPendingOrdersModalOpen] = useState(false);
  const [isSpecialOptionsModalOpen, setIsSpecialOptionsModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSlideOutMenuOpen, setIsSlideOutMenuOpen] = useState(false);
  const [initialOpenOptionId, setInitialOpenOptionId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);
  const [isDoorOpening, setIsDoorOpening] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [editingSite, setEditingSite] = useState<{ customerId: string; siteId: string; name: string; info: string; files: UploadedFile[] } | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ customerId: string; siteId: string; orderId: string; part: 'frames' | 'doors'; number: string; notes: string; } | null>(null);
  const [editingCustomerNotes, setEditingCustomerNotes] = useState<{ customerId: string; name: string; notes: string; } | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
  } | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLButtonElement>(null);

  const isAdmin = currentUser.role === 'Admin';
  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Editor';

  useEffect(() => {
    const openTimer = setTimeout(() => setIsDoorOpening(true), 500);
    const removeTimer = setTimeout(() => setIsSplashScreenVisible(false), 2500);
    return () => {
        clearTimeout(openTimer);
        clearTimeout(removeTimer);
    };
  }, []);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const [customersData, optionsData, usersData] = await Promise.all([
          api.getCustomers(),
          api.getSpecialOptions(),
          api.getUsers(),
        ]);
        setCustomers(customersData);
        setSpecialOptions(optionsData);
        setUsers(usersData);
        setIsLoading(false);
      };
    fetchData();
  }, []);

  useEffect(() => {
    if (editingCustomerId) {
        customerInputRef.current?.focus();
        customerInputRef.current?.select();
    }
  }, [editingCustomerId]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // --- User Handlers ---
  const handleAddUser = async (name: string, email: string, password: string, role: User['role']) => {
    try {
        const newUser = await api.addUser(name, email, password, role);
        setUsers(prev => [...prev, newUser]);
        addToast(`Utilisateur "${name}" ajouté.`);
    } catch (error) {
        addToast(error instanceof Error ? error.message : "Une erreur est survenue.", 'error');
    }
  };
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setConfirmation({
        isOpen: true,
        title: "Supprimer l'Utilisateur",
        message: <p className="confirmation-message">Êtes-vous sûr de vouloir supprimer l'utilisateur "<strong>{user.name}</strong>" ?</p>,
        onConfirm: async () => {
            await api.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            addToast(`Utilisateur "${user.name}" supprimé.`);
            setConfirmation(null);
        },
    });
  };

    const handleSaveUserProfile = async (userId: string, updates: Partial<{ name: string; email: string; password?: string; role: User['role'] }>) => {
        try {
            const updatedUser = await api.updateUser(userId, updates);
            if (updatedUser) {
                setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
                if (currentUser.id === userId) {
                    onUserUpdate(updatedUser);
                }
                addToast(`Profil utilisateur mis à jour.`);
                setUserToEdit(null); // Close modal
            }
        } catch(error) {
             addToast(error instanceof Error ? error.message : "Une erreur est survenue.", 'error');
        }
    };


  const handleAddCustomer = async (name: string) => {
    const newCustomer = await api.addCustomer(name);
    setCustomers(prev => [...prev, newCustomer]);
    addToast(`Client "${name}" ajouté.`);
    setIsAddCustomerModalOpen(false);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    setConfirmation({
        isOpen: true,
        title: `Supprimer le Client`,
        message: (
            <p className="confirmation-message">
                Êtes-vous sûr de vouloir supprimer le client "<strong>{customer.name}</strong>" ?
                <br />
                Tous les chantiers et commandes associés seront également définitivement supprimés.
            </p>
        ),
        onConfirm: async () => {
            await api.deleteCustomer(customerId);
            setCustomers(prev => prev.filter(c => c.id !== customerId));
            if (selectedCustomerId === customerId) {
                setSelectedCustomerId(null);
            }
            setConfirmation(null);
        },
    });
  };
  
  const handleEditCustomerClick = (customer: Customer) => {
      setEditingCustomerId(customer.id);
      setEditedCustomerName(customer.name);
  };

  const handleCustomerNameSave = async () => {
      if (!editingCustomerId) return;
      const originalCustomer = customers.find(c => c.id === editingCustomerId);
      if (originalCustomer && editedCustomerName.trim() && editedCustomerName.trim() !== originalCustomer.name) {
          const updatedCustomer = await api.updateCustomer(editingCustomerId, { name: editedCustomerName.trim() });
          if(updatedCustomer) {
            setCustomers(prev => prev.map(c => c.id === editingCustomerId ? updatedCustomer : c));
          }
      }
      setEditingCustomerId(null);
  };

  const handleCustomerNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleCustomerNameSave();
      } else if (e.key === 'Escape') {
          setEditingCustomerId(null);
      }
  };

  const handleOpenCustomerNotesModal = (customer: Customer) => {
    setEditingCustomerNotes({
        customerId: customer.id,
        name: customer.name,
        notes: customer.notes || '',
    });
  };

  const handleSaveCustomerNotes = async (newNotes: string) => {
    if (!editingCustomerNotes) return;
    const { customerId } = editingCustomerNotes;
    const updatedCustomer = await api.updateCustomer(customerId, { notes: newNotes });
    if(updatedCustomer) {
        setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
    }
    addToast('Notes du client mises à jour.');
    setEditingCustomerNotes(null);
  };

  const handleAddSite = async (e: React.FormEvent, customerId: string) => {
    e.preventDefault();
    const siteName = newSiteNames[customerId]?.trim();
    if (siteName) {
      const newSite = await api.addSite(customerId, siteName);
      setCustomers(prev => prev.map(c => c.id === customerId ? {...c, sites: [...c.sites, newSite]} : c));
      setNewSiteNames(prev => ({...prev, [customerId]: ''}));
      setOpenSiteId(newSite.id);
    }
  };

  const handleDeleteSite = (customerId: string, siteId: string) => {
    const customer = customers.find(c => c.id === customerId);
    const site = customer?.sites.find(s => s.id === siteId);
    if (!customer || !site) return;

    setConfirmation({
        isOpen: true,
        title: 'Supprimer le Chantier',
        message: (
            <p className="confirmation-message">
                Êtes-vous sûr de vouloir supprimer le chantier "<strong>{site.name}</strong>" ?
                <br />
                Toutes les commandes de ce chantier seront également définitivement supprimées.
            </p>
        ),
        onConfirm: async () => {
            await api.deleteSite(customerId, siteId);
            setCustomers(prev => prev.map(c => 
                c.id === customerId 
                ? {...c, sites: c.sites.filter(s => s.id !== siteId)} 
                : c
            ));
            setConfirmation(null);
        },
    });
  };

  const handleUpdateSiteInfo = useCallback(async (customerId: string, siteId: string, info: string) => {
    const updatedSite = await api.updateSite(customerId, siteId, { generalInfo: info });
    if(updatedSite) {
        setCustomers(prev => prev.map(c => c.id === customerId 
            ? {...c, sites: c.sites.map(s => s.id === siteId ? updatedSite : s)}
            : c
        ));
    }
  }, []);

  const handleUpdateSiteName = async (customerId: string, siteId: string, newName: string) => {
    const updatedSite = await api.updateSite(customerId, siteId, { name: newName });
    if(updatedSite) {
        setCustomers(prev => prev.map(c => c.id === customerId 
            ? {...c, sites: c.sites.map(s => s.id === siteId ? updatedSite : s)}
            : c
        ));
    }
  };

  const handleAddFileToSite = async (file: File) => {
    if (!editingSite) return;
    const { customerId, siteId } = editingSite;
    try {
        const newFile = await api.addFileToSite(customerId, siteId, file);
        setCustomers(prev => prev.map(c => c.id === customerId 
            ? {...c, sites: c.sites.map(s => s.id === siteId 
                ? {...s, generalInfoFiles: [...(s.generalInfoFiles || []), newFile] } 
                : s
            )}
            : c
        ));
        setEditingSite(prev => prev ? {...prev, files: [...prev.files, newFile]} : null);
        addToast(`Fichier "${file.name}" ajouté.`);
    } catch (error) {
        addToast(error instanceof Error ? error.message : "Erreur lors de l'ajout du fichier.", 'error');
    }
  };

  const handleDeleteFileFromSite = (fileId: string) => {
      if (!editingSite) return;
      const file = editingSite.files.find(f => f.id === fileId);
      if (!file) return;

      setConfirmation({
          isOpen: true,
          title: 'Supprimer le Fichier',
          message: <p className="confirmation-message">Êtes-vous sûr de vouloir supprimer le fichier "<strong>{file.name}</strong>" ?</p>,
          onConfirm: async () => {
              if (!editingSite) return;
              const { customerId, siteId } = editingSite;
              await api.deleteFileFromSite(customerId, siteId, fileId);
              setCustomers(prev => prev.map(c => c.id === customerId 
                  ? {...c, sites: c.sites.map(s => s.id === siteId 
                      ? {...s, generalInfoFiles: s.generalInfoFiles.filter(f => f.id !== fileId) } 
                      : s
                  )}
                  : c
              ));
              setEditingSite(prev => prev ? {...prev, files: prev.files.filter(f => f.id !== fileId)} : null);
              addToast(`Fichier "${file.name}" supprimé.`);
              setConfirmation(null);
          },
      });
  };

  const handleAddOrder = async (customerId: string, siteId: string, framesNumber: string, doorsNumber: string, userId: string) => {
    const newOrders = await api.addOrder(customerId, siteId, framesNumber, doorsNumber, userId);
    if (newOrders && newOrders.length > 0) {
      setCustomers(prev => prev.map(c => c.id === customerId 
        ? {...c, sites: c.sites.map(s => s.id === siteId ? {...s, orders: [...s.orders, ...newOrders]} : s)}
        : c
      ));
    }
  };

  const handleDeleteOrder = (customerId: string, siteId: string, orderId: string) => {
    const customer = customers.find(c => c.id === customerId);
    const site = customer?.sites.find(s => s.id === siteId);
    const order = site?.orders.find(o => o.id === orderId);
    if (!order) return;
    
    setConfirmation({
        isOpen: true,
        title: 'Supprimer la Commande',
        message: <p className="confirmation-message">Êtes-vous sûr de vouloir supprimer cette entrée de commande ?</p>,
        onConfirm: async () => {
            await api.deleteOrder(customerId, siteId, orderId);
            setCustomers(prev => prev.map(c => c.id === customerId 
                ? {...c, sites: c.sites.map(s => s.id === siteId ? {...s, orders: s.orders.filter(o => o.id !== orderId)} : s)}
                : c
            ));
            setConfirmation(null);
        }
    });
  };

  const handleToggleOrderStatus = async (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors') => {
    const updatedOrder = await api.toggleOrderStatus(customerId, siteId, orderId, part);
    if(updatedOrder){
        setCustomers(prev => prev.map(c => c.id === customerId 
            ? {...c, sites: c.sites.map(s => s.id === siteId ? {...s, orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)} : s)}
            : c
        ));
        addToast('Statut mis à jour !');
    }
  };

  const handleUpdateOrderNumber = async (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors', newNumber: string) => {
    const updatedOrder = await api.updateOrder(customerId, siteId, orderId, part, newNumber);
    if(updatedOrder){
        setCustomers(prev => prev.map(c => c.id === customerId 
            ? {...c, sites: c.sites.map(s => s.id === siteId ? {...s, orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)} : s)}
            : c
        ));
    }
  };
  
  const handleUpdateOrderUser = async (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors', userId: string) => {
    const updatedOrder = await api.updateOrderUser(customerId, siteId, orderId, part, userId);
    if(updatedOrder){
        setCustomers(prev => prev.map(c => c.id === customerId 
            ? {...c, sites: c.sites.map(s => s.id === siteId ? {...s, orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)} : s)}
            : c
        ));
        addToast('Utilisateur assigné mis à jour !');
    }
  };
  
  const handleUpdateOrderNotes = useCallback(async (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors', notes: string) => {
    const updatedOrder = await api.updateOrderNotes(customerId, siteId, orderId, part, notes);
    if(updatedOrder){
        setCustomers(prev => prev.map(c => c.id === customerId 
            ? {...c, sites: c.sites.map(s => s.id === siteId ? {...s, orders: s.orders.map(o => o.id === orderId ? updatedOrder : o)} : s)}
            : c
        ));
    }
  }, []);

  const handleOpenNotesModal = (orderId: string, part: 'frames' | 'doors', number: string, notes: string) => {
    if (!selectedCustomerId || !openSiteId) return;
    setEditingNotes({
        customerId: selectedCustomerId,
        siteId: openSiteId,
        orderId,
        part,
        number,
        notes
    });
  };

  const handleSaveNotes = async (newNotes: string) => {
    if (!editingNotes) return;
    const { customerId, siteId, orderId, part } = editingNotes;
    await handleUpdateOrderNotes(customerId, siteId, orderId, part, newNotes);
    addToast('Notes mises à jour.');
    setEditingNotes(null);
  };

  const handleNewSiteNameChange = (customerId: string, name: string) => {
      setNewSiteNames(prev => ({...prev, [customerId]: name}));
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setOpenSiteId(null);
  }
  
  const handleToggleSitePanel = (siteId: string) => {
    setOpenSiteId(prevOpenId => (prevOpenId === siteId ? null : siteId));
  }
  
  const handleNavigateToSite = (customerId: string, siteId: string) => {
    setSelectedCustomerId(customerId);
    setOpenSiteId(siteId);
    setIsPendingOrdersModalOpen(false);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    if (result.optionId) {
        setInitialOpenOptionId(result.optionId);
        setIsSpecialOptionsModalOpen(true);
    } else if (result.customerId) {
        setSelectedCustomerId(result.customerId);
        if (result.siteId) {
            setOpenSiteId(result.siteId);
        } else {
            setOpenSiteId(null);
        }
    }
    
    setGlobalSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleAddSpecialOption = async (name: string) => {
    const newOption = await api.addSpecialOption(name);
    setSpecialOptions(prev => [...prev, newOption]);
  };

  const handleDeleteSpecialOption = (optionId: string) => {
    const option = specialOptions.find(o => o.id === optionId);
    if (!option) return;
    setConfirmation({
        isOpen: true,
        title: "Supprimer l'Option Spéciale",
        message: <p className="confirmation-message">Êtes-vous sûr de vouloir supprimer l'option "<strong>{option.name}</strong>" ?</p>,
        onConfirm: async () => {
            await api.deleteSpecialOption(optionId);
            setSpecialOptions(prev => prev.filter(o => o.id !== optionId));
            setConfirmation(null);
        },
    });
  };

  const handleUpdateSpecialOption = async (optionId: string, updates: Partial<Pick<SpecialOption, 'name' | 'details'>>) => {
    const updatedOption = await api.updateSpecialOption(optionId, updates);
    if(updatedOption) {
        setSpecialOptions(prev => prev.map(o => o.id === optionId ? updatedOption : o));
    }
  };

  const handleAddFileToOption = async (optionId: string, file: File) => {
    const newFile = await api.addFileToOption(optionId, file);
    setSpecialOptions(prev => prev.map(o => o.id === optionId ? {...o, files: [...o.files, newFile]} : o));
  };

  const handleDeleteFileFromOption = (optionId: string, fileId: string) => {
    const option = specialOptions.find(o => o.id === optionId);
    const file = option?.files.find(f => f.id === fileId);
    if (!file) return;

    setConfirmation({
        isOpen: true,
        title: 'Supprimer le Fichier',
        message: <p className="confirmation-message">Êtes-vous sûr de vouloir supprimer le fichier "<strong>{file.name}</strong>" ?</p>,
        onConfirm: async () => {
            await api.deleteFileFromOption(optionId, fileId);
            setSpecialOptions(prev => prev.map(o => o.id === optionId ? {...o, files: o.files.filter(f => f.id !== fileId)} : o));
            setConfirmation(null);
        },
    });
  };

  const handleExportData = (customerIds: string[]) => {
    if (customerIds.length === 0) {
        addToast("Veuillez sélectionner au moins un client à exporter.", 'error');
        return;
    }

    const selectedCustomers = customers.filter(c => customerIds.includes(c.id));

    const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            const escapedStr = str.replace(/"/g, '""');
            return `"${escapedStr}"`;
        }
        return str;
    };

    const headers = [
        'CustomerID', 'CustomerName', 'CustomerNotes',
        'SiteID', 'SiteName', 'SiteGeneralInfo',
        'OrderID', 'OrderPart', 'OrderNumber',
        'OrderStatus', 'OrderCreationDate', 'OrderAssignedUser', 'OrderNotes'
    ];

    const rows: string[][] = [];

    selectedCustomers.forEach(customer => {
        if (customer.sites.length === 0) {
            rows.push([
                escapeCsvField(customer.id),
                escapeCsvField(customer.name),
                escapeCsvField(customer.notes),
                '', '', '', '', '', '', '', '', '', ''
            ]);
        } else {
            customer.sites.forEach(site => {
                const flattenedOrders = site.orders.flatMap(order => {
                    const parts: { orderId: string, partName: string, partData: OrderPart }[] = [];
                    if (order.frames) {
                        parts.push({ orderId: order.id, partName: 'Huisseries', partData: order.frames });
                    }
                    if (order.doors) {
                        parts.push({ orderId: order.id, partName: 'Portes', partData: order.doors });
                    }
                    return parts;
                });

                if (flattenedOrders.length === 0) {
                    rows.push([
                        escapeCsvField(customer.id),
                        escapeCsvField(customer.name),
                        escapeCsvField(customer.notes),
                        escapeCsvField(site.id),
                        escapeCsvField(site.name),
                        escapeCsvField(site.generalInfo),
                        '', '', '', '', '', '', ''
                    ]);
                } else {
                    flattenedOrders.forEach(({ orderId, partName, partData }) => {
                        const row = [
                            escapeCsvField(customer.id),
                            escapeCsvField(customer.name),
                            escapeCsvField(customer.notes),
                            escapeCsvField(site.id),
                            escapeCsvField(site.name),
                            escapeCsvField(site.generalInfo),
                            escapeCsvField(orderId),
                            escapeCsvField(partName),
                            escapeCsvField(partData.number),
                            escapeCsvField(partData.isSent ? 'Envoyée' : 'En attente'),
                            escapeCsvField(new Date(partData.creationDate).toLocaleString('fr-FR')),
                            escapeCsvField(partData.userName),
                            escapeCsvField(partData.notes),
                        ];
                        rows.push(row);
                    });
                }
            });
        }
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `export_batiserv_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('Exportation réussie !');
    setIsExportModalOpen(false);
  };

  const handleImportData = async (csvString: string) => {
    if (!csvString) {
        addToast("Le fichier est vide ou illisible.", 'error');
        return;
    }
    try {
        const { customers: updatedCustomers, users: updatedUsers } = await api.importData(csvString);
        setCustomers(updatedCustomers);
        setUsers(updatedUsers);
        addToast("Données importées avec succès !");
        setIsImportModalOpen(false);
    } catch (error) {
        console.error("Import error:", error);
        addToast(error instanceof Error ? error.message : "Une erreur est survenue lors de l'importation.", 'error');
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const allPendingOrders: PendingOrderPart[] = customers.flatMap(customer =>
      customer.sites.flatMap(site => {
        const pendingParts: PendingOrderPart[] = [];
        site.orders.forEach(order => {
          if (order.frames && !order.frames.isSent) {
            pendingParts.push({
              orderId: order.id,
              part: 'frames',
              number: order.frames.number,
              customerName: customer.name,
              customerId: customer.id,
              siteName: site.name,
              siteId: site.id,
              creationDate: order.frames.creationDate,
              userId: order.frames.userId,
            });
          }
          if (order.doors && !order.doors.isSent) {
            pendingParts.push({
              orderId: order.id,
              part: 'doors',
              number: order.doors.number,
              customerName: customer.name,
              customerId: customer.id,
              siteName: site.name,
              siteId: site.id,
              creationDate: order.doors.creationDate,
              userId: order.doors.userId,
            });
          }
        });
        return pendingParts;
      })
  );

  const query = globalSearchQuery.toLowerCase();

  const customerSearchResults: SearchResult[] = !globalSearchQuery ? [] : customers.flatMap(customer => {
      const results: SearchResult[] = [];
      if (customer.name.toLowerCase().includes(query)) {
          results.push({ type: 'Client', name: customer.name, customerId: customer.id, key: `cust-${customer.id}` });
      }
      customer.sites.forEach(site => {
          if (site.name.toLowerCase().includes(query)) {
              results.push({ type: 'Chantier', name: site.name, context: customer.name, customerId: customer.id, siteId: site.id, key: `site-${site.id}` });
          }
          site.orders.forEach(order => {
            if (order.frames && order.frames.number.toLowerCase().includes(query)) {
                results.push({ type: 'Huisseries', name: order.frames.number, context: `${customer.name} / ${site.name}`, customerId: customer.id, siteId: site.id, key: `order-${order.id}-frames` });
            }
            if (order.doors && order.doors.number.toLowerCase().includes(query)) {
                results.push({ type: 'Portes', name: order.doors.number, context: `${customer.name} / ${site.name}`, customerId: customer.id, siteId: site.id, key: `order-${order.id}-doors` });
            }
          });
      });
      return results;
  });

  const specialOptionsSearchResults: SearchResult[] = !globalSearchQuery ? [] : specialOptions
      .filter(option => 
          option.name.toLowerCase().includes(query) || 
          option.details.toLowerCase().includes(query)
      )
      .map(option => ({
          type: 'Option',
          name: option.name,
          context: 'Options Spéciales',
          optionId: option.id,
          key: `option-${option.id}`
      }));

  const searchResults: SearchResult[] = [...customerSearchResults, ...specialOptionsSearchResults];


  return (
    <div className="app-wrapper">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {isSplashScreenVisible && <SplashScreen isOpening={isDoorOpening} />}
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
              <img src="https://i.ibb.co/Z1vqcYCj/Batiserv-1-1.png" alt="Batiserv Logo" className="header-logo" />
          </div>
          <div className="global-search-container" onBlur={() => setTimeout(() => setIsSearchFocused(false), 100)}>
              <input
                  type="text"
                  placeholder="Rechercher clients, chantiers, commandes..."
                  className="global-search-input"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  aria-label="Recherche globale"
              />
              {isSearchFocused && globalSearchQuery && (
                  <div className="search-results-dropdown">
                      {searchResults.length > 0 ? (
                          <ul className="search-results-list">
                              {searchResults.map((result) => (
                                  <li key={result.key} className="search-result-item" onMouseDown={() => handleSearchResultClick(result)}>
                                      <span className={`result-type result-type-${result.type.toLowerCase()}`}>{result.type}</span>
                                      <div className="result-details">
                                        <span className="result-name">{result.name}</span>
                                        {result.context && <span className="result-context">{result.context}</span>}
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <div className="no-search-results">Aucun résultat trouvé</div>
                      )}
                  </div>
              )}
          </div>
          <div className="header-right">
              {isMobile ? (
                 <button className="menu-btn" onClick={() => setIsSlideOutMenuOpen(true)} aria-label="Ouvrir le menu">
                    <MenuIcon />
                </button>
              ) : (
                <>
                    <button className="special-options-btn" onClick={() => setIsSpecialOptionsModalOpen(true)}>Options<span> Spéciales</span></button>
                    <button className="pending-orders-btn" onClick={() => setIsPendingOrdersModalOpen(true)}>
                        <span className="pending-orders-text">Commandes en Attente</span>
                        {allPendingOrders.length > 0 && <span className="pending-count">{allPendingOrders.length}</span>}
                    </button>
                    <div className="user-profile-menu-container">
                        <button
                            ref={userMenuRef}
                            className={`user-profile-btn ${isUserMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsUserMenuOpen(prev => !prev)}
                            aria-label="Ouvrir le menu utilisateur"
                        >
                            <PersonIcon />
                            <span>{currentUser.name}</span>
                            <ChevronIcon />
                        </button>
                        <DropdownMenu 
                            isOpen={isUserMenuOpen} 
                            onClose={() => setIsUserMenuOpen(false)}
                            triggerRef={userMenuRef}
                        >
                            <DropdownItem onClick={() => { setUserToEdit(currentUser); setIsUserMenuOpen(false); }}>
                                <SettingsIcon />
                                <span>Mon Profil</span>
                            </DropdownItem>
                            <li className="dropdown-divider"></li>
                            {isAdmin && (
                                <>
                                    <DropdownItem onClick={() => { setIsUsersModalOpen(true); setIsUserMenuOpen(false); }}>
                                        <UsersIcon />
                                        <span>Gérer les Utilisateurs</span>
                                    </DropdownItem>
                                    <DropdownItem onClick={() => { setIsImportModalOpen(true); setIsUserMenuOpen(false); }}>
                                        <UploadIcon />
                                        <span>Importer les Données</span>
                                    </DropdownItem>
                                    <DropdownItem onClick={() => { setIsExportModalOpen(true); setIsUserMenuOpen(false); }}>
                                        <DownloadIcon />
                                        <span>Exporter les Données</span>
                                    </DropdownItem>
                                    <li className="dropdown-divider"></li>
                                </>
                            )}
                            <DropdownItem onClick={() => {
                                onLogout();
                                setIsUserMenuOpen(false);
                            }}>
                                <LogoutIcon />
                                <span>Déconnexion</span>
                            </DropdownItem>
                        </DropdownMenu>
                    </div>
                </>
              )}
          </div>
        </header>
        <div className={`app-body ${isMobile && selectedCustomerId ? 'mobile-main-view' : ''}`}>
          <aside className="customer-sidebar">
            <div className="sidebar-header">
              <h2>Clients</h2>
              <div className="sidebar-header-actions">
                  {canEdit && (
                    <button className="add-customer-icon-btn" onClick={() => setIsAddCustomerModalOpen(true)} aria-label="Ajouter un nouveau client">
                        <AddIcon />
                    </button>
                  )}
              </div>
            </div>
            <ul className="customer-list">
              {customers.map(customer => (
                  <li 
                      key={customer.id} 
                      className={customer.id === selectedCustomerId ? 'active' : ''}
                      onClick={() => editingCustomerId !== customer.id && handleSelectCustomer(customer.id)}
                  >
                      {editingCustomerId === customer.id && canEdit ? (
                          <input
                              ref={customerInputRef}
                              type="text"
                              value={editedCustomerName}
                              onChange={(e) => setEditedCustomerName(e.target.value)}
                              onBlur={handleCustomerNameSave}
                              onKeyDown={handleCustomerNameKeyDown}
                              onClick={(e) => e.stopPropagation()}
                              className="customer-name-edit"
                              aria-label="Modifier le nom du client"
                          />
                      ) : (
                          <>
                              <span className="customer-name">{customer.name}</span>
                              <div className="customer-actions">
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenCustomerNotesModal(customer); }} className="notes-btn" aria-label={`Notes pour ${customer.name}`}><CommentIcon /></button>
                                  {canEdit && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); handleEditCustomerClick(customer); }} className="edit-btn" aria-label={`Modifier le client ${customer.name}`}><EditIcon /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }} className="delete-btn" aria-label={`Supprimer le client ${customer.name}`}><DeleteIcon /></button>
                                    </>
                                  )}
                              </div>
                          </>
                      )}
                  </li>
              ))}
               {customers.length === 0 && !isLoading && <li className="no-customers">Aucun client pour l'instant.</li>}
            </ul>
          </aside>
          <main className="main-content">
            {isLoading ? <Loader /> : selectedCustomer ? (
              <div className="customer-details">
                  <div className="content-header">
                      {isMobile && (
                          <button className="back-btn" onClick={() => setSelectedCustomerId(null)} aria-label="Retour à la liste des clients">
                              <BackArrowIcon />
                          </button>
                      )}
                      <h2>
                          <span className="desktop-only">Chantiers de </span>
                          {selectedCustomer.name}
                      </h2>
                      {canEdit && (
                        <form onSubmit={(e) => handleAddSite(e, selectedCustomer.id)} className="add-form">
                            <input
                               type="text"
                               value={newSiteNames[selectedCustomer.id] || ''}
                               onChange={(e) => handleNewSiteNameChange(selectedCustomer.id, e.target.value)}
                               placeholder="Nom du nouveau chantier"
                               aria-label="Nom du nouveau chantier"
                            />
                            <button type="submit">Ajouter un Chantier</button>
                       </form>
                      )}
                  </div>

                  <div className="sites-list">
                    {selectedCustomer.sites.map(site => (
                        <SitePanel
                            key={site.id}
                            site={site}
                            customerId={selectedCustomer.id}
                            users={users}
                            isOpen={site.id === openSiteId}
                            onToggle={() => handleToggleSitePanel(site.id)}
                            onOpenInfoModal={() => setEditingSite({
                                customerId: selectedCustomer.id,
                                siteId: site.id,
                                name: site.name,
                                info: site.generalInfo,
                                files: site.generalInfoFiles || [],
                            })}
                            onUpdateSiteName={handleUpdateSiteName}
                            onAddOrder={handleAddOrder}
                            onDeleteOrder={handleDeleteOrder}
                            onToggleOrderStatus={handleToggleOrderStatus}
                            onUpdateOrderNumber={handleUpdateOrderNumber}
                            onUpdateOrderUser={handleUpdateOrderUser}
                            onOpenNotesModal={handleOpenNotesModal}
                            onDeleteSite={handleDeleteSite}
                            currentUser={currentUser}
                            canEdit={canEdit}
                        />
                    ))}
                    {selectedCustomer.sites.length === 0 && (
                        <div className="placeholder">
                            <p>Aucun chantier pour ce client. Ajoutez-en un ci-dessus !</p>
                        </div>
                    )}
                  </div>
              </div>
            ) : (
              <div className="welcome-screen">
                  <h2>Bienvenue, {currentUser.name} !</h2>
                  <p>Sélectionnez un client dans la liste de gauche pour voir ses chantiers.</p>
                  {canEdit && <p>Si vous n'avez pas encore de clients, ajoutez-en un pour commencer.</p>}
              </div>
            )}
          </main>
        </div>
        {isPendingOrdersModalOpen && (
          <PendingOrdersModal
              orders={allPendingOrders}
              users={users}
              onClose={() => setIsPendingOrdersModalOpen(false)}
              onToggleStatus={handleToggleOrderStatus}
              onNavigate={handleNavigateToSite}
              canEdit={canEdit}
          />
        )}
        {isAdmin && (
            <UsersModal
                isOpen={isUsersModalOpen}
                onClose={() => setIsUsersModalOpen(false)}
                users={users}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onEditUser={setUserToEdit}
            />
        )}
         <SpecialOptionsModal
              isOpen={isSpecialOptionsModalOpen}
              onClose={() => {
                setIsSpecialOptionsModalOpen(false);
                setInitialOpenOptionId(null);
              }}
              options={specialOptions}
              onAddOption={handleAddSpecialOption}
              onDeleteOption={handleDeleteSpecialOption}
              onUpdateOption={handleUpdateSpecialOption}
              onAddFile={handleAddFileToOption}
              onDeleteFile={handleDeleteFileFromOption}
              initialOpenOptionId={initialOpenOptionId}
              canEdit={canEdit}
          />
        {isAddCustomerModalOpen && canEdit && (
            <AddCustomerModal
                isOpen={isAddCustomerModalOpen}
                onClose={() => setIsAddCustomerModalOpen(false)}
                onAdd={handleAddCustomer}
            />
        )}
        {isExportModalOpen && isAdmin && (
            <ExportDataModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                customers={customers}
                onExport={handleExportData}
            />
        )}
        {isImportModalOpen && isAdmin && (
            <ImportDataModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportData}
                addToast={addToast}
            />
        )}
        {editingSite && (
            <GeneralInfoModal
                isOpen={!!editingSite}
                onClose={() => setEditingSite(null)}
                siteName={editingSite.name}
                generalInfo={editingSite.info}
                files={editingSite.files}
                onSave={(newInfo) => {
                    handleUpdateSiteInfo(editingSite.customerId, editingSite.siteId, newInfo);
                    setEditingSite(prev => prev ? { ...prev, info: newInfo } : null);
                    addToast('Notes générales mises à jour.');
                }}
                onAddFile={handleAddFileToSite}
                onDeleteFile={handleDeleteFileFromSite}
                canEdit={canEdit}
            />
        )}
        {editingNotes && (
            <OrderNotesModal
                isOpen={!!editingNotes}
                onClose={() => setEditingNotes(null)}
                onSave={handleSaveNotes}
                orderNumber={editingNotes.number}
                partName={editingNotes.part === 'frames' ? 'Huisseries' : 'Portes'}
                initialNotes={editingNotes.notes}
                canEdit={canEdit}
            />
        )}
        {editingCustomerNotes && (
            <CustomerNotesModal
                isOpen={!!editingCustomerNotes}
                onClose={() => setEditingCustomerNotes(null)}
                onSave={handleSaveCustomerNotes}
                customerName={editingCustomerNotes.name}
                initialNotes={editingCustomerNotes.notes}
                canEdit={canEdit}
            />
        )}
        {confirmation?.isOpen && (
          <ConfirmationModal
              isOpen={confirmation.isOpen}
              title={confirmation.title}
              onClose={() => setConfirmation(null)}
              onConfirm={confirmation.onConfirm}
          >
              {confirmation.message}
          </ConfirmationModal>
        )}
        {userToEdit && (
            <UserProfileModal
                isOpen={!!userToEdit}
                onClose={() => setUserToEdit(null)}
                userToEdit={userToEdit}
                currentUser={currentUser}
                users={users}
                onSave={handleSaveUserProfile}
                addToast={addToast}
            />
        )}
        {isMobile && (
            <SlideOutMenu isOpen={isSlideOutMenuOpen} onClose={() => setIsSlideOutMenuOpen(false)}>
                <DropdownItem onClick={() => { setIsPendingOrdersModalOpen(true); setIsSlideOutMenuOpen(false); }}>
                    <HourglassIcon />
                    <span>
                        Commandes en Attente
                        {allPendingOrders.length > 0 && <span className="pending-count-menu">{allPendingOrders.length}</span>}
                    </span>
                </DropdownItem>
                <DropdownItem onClick={() => { setIsSpecialOptionsModalOpen(true); setIsSlideOutMenuOpen(false); }}>
                    <StarIcon />
                    <span>Options Spéciales</span>
                </DropdownItem>
                <li className="dropdown-divider"></li>
                <DropdownItem onClick={() => { setUserToEdit(currentUser); setIsSlideOutMenuOpen(false); }}>
                    <SettingsIcon />
                    <span>Mon Profil</span>
                </DropdownItem>
                {isAdmin && (
                    <>
                         <li className="dropdown-divider"></li>
                        <DropdownItem onClick={() => { setIsUsersModalOpen(true); setIsSlideOutMenuOpen(false); }}>
                            <UsersIcon />
                            <span>Gérer les Utilisateurs</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => { setIsImportModalOpen(true); setIsSlideOutMenuOpen(false); }}>
                            <UploadIcon />
                            <span>Importer les Données</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => { setIsExportModalOpen(true); setIsSlideOutMenuOpen(false); }}>
                            <DownloadIcon />
                            <span>Exporter les Données</span>
                        </DropdownItem>
                    </>
                )}
                <li className="dropdown-divider"></li>
                <DropdownItem onClick={() => { onLogout(); setIsSlideOutMenuOpen(false); }}>
                    <LogoutIcon />
                    <span>Déconnexion</span>
                </DropdownItem>
            </SlideOutMenu>
        )}
      </div>
    </div>
  );
};

// --- Auth Wrapper ---
const Auth: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [authScreen, setAuthScreen] = useState<'login' | 'signup' | 'recover'>('login');
    const [toast, addToast] = useState('');

    useEffect(() => {
        // This effect only runs once to hide the initial loader.
        // The initial state already checks sessionStorage.
        setIsAuthLoading(false);
    }, []);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };

    const handleUserUpdate = (user: User) => {
        setCurrentUser(user);
        // Also update sessionStorage so the change persists on refresh
        try {
            sessionStorage.setItem(api.CURRENT_USER_KEY, JSON.stringify(user));
        } catch (e) {
            console.error("Failed to update user in sessionStorage", e);
        }
    };

    const handleLogout = async () => {
        await api.logout();
        setCurrentUser(null);
    };

    if (isAuthLoading) {
        return <Loader />;
    }

    if (currentUser) {
        return <App currentUser={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
    }

    switch (authScreen) {
        case 'signup':
            return <SignUpScreen 
                onNavigateToLogin={() => setAuthScreen('login')} 
                onSignupSuccess={() => {
                    // In a real app you might show a toast. Here we just switch screens.
                    setAuthScreen('login');
                }} 
            />;
        case 'recover':
            return <RecoverPasswordScreen onNavigateToLogin={() => setAuthScreen('login')} />;
        case 'login':
        default:
            return <LoginScreen 
                onLoginSuccess={handleLoginSuccess}
                onNavigateToSignup={() => setAuthScreen('signup')}
                onNavigateToRecover={() => setAuthScreen('recover')}
            />
    }
};


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Auth />);