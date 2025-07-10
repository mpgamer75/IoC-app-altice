const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validación de la valor según el tipo
    if (!formData.value.trim()) {
      newErrors.value = 'Este campo es obligatorio';
    } else {
      switch (type) {
        case 'ip':
          const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          if (!ipRegex.test(formData.value)) {
            newErrors.value = 'Formato de IP inválido (ej: 192.168.1.1)';
          }
          break;
        case 'domain':
          const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
          if (!domainRegex.test(formData.value)) {
            newErrors.value = 'Formato de dominio inválido (ej: ejemplo.com)';
          }
          break;
        case 'url':
          try {
            new URL(formData.value);
          } catch {
            newErrors.value = 'Formato de URL inválido (ej: https://ejemplo.com)';
          }
          break;
        case 'hash':
          const hashRegex = /^[a-fA-F0-9]{32,128}$/;
          if (!hashRegex.test(formData.value)) {
            newErrors.value = 'Formato de hash inválido (MD5, SHA1, SHA256, etc.)';
          }
          break;
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'La fuente es obligatoria';
    }

    if (!formData.reporter.trim()) {
      newErrors.reporter = 'El nombre del reportador es obligatorio';
    }

    if (!formData.reporterEmail.trim()) {
      newErrors.reporterEmail = 'El email del reportador es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.reporterEmail)) {
        newErrors.reporterEmail = 'Formato de email inválido';
      }
    }

    if (formData.confidence < 0 || formData.confidence > 100) {
      newErrors.confidence = 'La confianza debe estar entre 0 y 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const iocData: Omit<IoC, 'id' | 'dateReported'> = {
        type,
        value: formData.value.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        source: formData.source.trim(),
        reporter: formData.reporter.trim(),
        reporterEmail: formData.reporterEmail.trim(),
        status: 'pending',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        tlp: formData.tlp,
        confidence: formData.confidence,
        notes: formData.notes.trim() || undefined,
        references: formData.references ? formData.references.split('\n').map(ref => ref.trim()).filter(Boolean) : undefined,
        firstSeen: formData.firstSeen ? new Date(formData.firstSeen) : undefined,
        lastSeen: formData.lastSeen ? new Date(formData.lastSeen) : undefined
      };

      await IoCService.createIoC(iocData);
      
      // Mostrar notificación de éxito
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            message: `IoC ${getTypeLabel()} creado exitosamente!`
          }
        });
        window.dispatchEvent(event);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error creando IoC:', error);
      setErrors({ submit: 'Error al crear el IoC' });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'ip': return 'Dirección IP';
      case 'domain': return 'Nombre de Dominio';
      case 'url': return 'URL';
      case 'hash': return 'Hash/Huella';
      default: return 'IoC';
    }
  };

  const getTypePlaceholder = () => {
    switch (type) {
      case 'ip': return '192.168.1.100';
      case 'domain': return 'sitio-malicioso.com';
      case 'url': return 'https://sitio-malicioso.com/ruta';
      case 'hash': return 'a1b2c3d4e5f6789012345678901234567890abcd';
      default: return '';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'ip': return '🌐';
      case 'domain': return '🏷️';
      case 'url': return '🔗';
      case 'hash': return '#️⃣';
      default: return '📄';
    }
  };

  const getTypeGradient = () => {
    switch (type) {
      case 'ip': return 'from-blue-500 to-blue-600';
      case 'domain': return 'from-green-500 to-green-600';
      case 'url': return 'from-purple-500 to-purple-600';
      case 'hash': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low': return '🟢 Baja';
      case 'medium': return '🟡 Media';
      case 'high': return '🟠 Alta';
      case 'critical': return '🔴 Crítica';
      default: return severity;
    }
  };

  const getTlpLabel = (tlp: string) => {
    switch (tlp) {
      case 'white': return '⚪ TLP:WHITE - Difusión libre';
      case 'green': return '🟢 TLP:GREEN - Comunidad';
      case 'amber': return '🟡 TLP:AMBER - Organización limitada';
      case 'red': return '🔴 TLP:RED - Solo personal';
      default: return tlp;
    }
  };

  return (
    <div className={`card animate-fade-in max-w-6xl mx-auto ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header con progreso */}
      <div className={`mb-8 border-b pb-6 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeGradient()} shadow-lg animate-scale-in`}>
              <span className="text-2xl text-white">
                {getTypeIcon()}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Agregar {getTypeLabel()}
              </h2>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Complete la información para agregar un nuevo indicador de compromiso
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Paso {step} de 3
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-2 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-red-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Paso 1: Información básica */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-in-right">
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📝 Información Básica
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2 dynamic-input">
                <label className={`block text-sm font-bold mb-2 flex items-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className="mr-2">🎯</span>
                  {getTypeLabel()} *
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    errors.value 
                      ? 'border-red-500 bg-red-50' 
                      : theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
                  } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                  placeholder={getTypePlaceholder()}
                />
                {errors.value && (
                  <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {errors.value}
                  </p>
                )}
              </div>

              <div className="space-y-2 dynamic-input">
                <label className={`block text-sm font-bold mb-2 flex items-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className="mr-2">⚡</span>
                  Severidad *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white focus:border-red-500'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-red-500'
                  } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                >
                  <option value="low">{getSeverityLabel('low')}</option>
                  <option value="medium">{getSeverityLabel('medium')}</option>
                  <option value="high">{getSeverityLabel('high')}</option>
                  <option value="critical">{getSeverityLabel('critical')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 dynamic-input">
              <label className={`block text-sm font-bold mb-2 flex items-center ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                <span className="mr-2">📝</span>
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl resize-none transition-all duration-200 ${
                  errors.description 
                    ? 'border-red-500 bg-red-50' 
                    : theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
                } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                placeholder="Descripción detallada de la amenaza, contexto de descubrimiento, impacto potencial..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Paso 2: Información del reportador */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-in-right">
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              👤 Información del Reportador
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2 dynamic-input">
                <label className={`block text-sm font-bold mb-2 flex items-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className="mr-2">👤</span>
                  Reportador *
                </label>
                <input
                  type="text"
                  value={formData.reporter}
                  onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    errors.reporter 
                      ? 'border-red-500 bg-red-50' 
                      : theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
                  } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                  placeholder="Nombre completo del reportador"
                />
                {errors.reporter && (
                  <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {errors.reporter}
                  </p>
                )}
              </div>

              <div className="space-y-2 dynamic-input">
                <label className={`block text-sm font-bold mb-2 flex items-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className="mr-2">📧</span>
                  Email del reportador *
                </label>
                <input
                  type="email"
                  value={formData.reporterEmail}
                  onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    errors.reporterEmail 
                      ? 'border-red-500 bg-red-50' 
                      : theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
                  } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                  placeholder="email@empresa.com"
                />
                {errors.reporterEmail && (
                  <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {errors.reporterEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2 dynamic-input">
                <label className={`block text-sm font-bold mb-2 flex items-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className="mr-2">📊</span>
                  Fuente *
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    errors.source 
                      ? 'border-red-500 bg-red-50' 
                      : theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
                  } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                  placeholder="Ej: SIEM, EDR, Inteligencia de Amenazas, Equipo de Seguridad..."
                />
                {errors.source && (
                  <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {errors.source}
                  </p>
                )}
              </div>

              <div className="space-y-2 dynamic-input">
                <label className={`block text-sm font-bold mb-2 flex items-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className="mr-2">🎯</span>
                  Nivel de confianza: {formData.confidence}%
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: parseInt(e.target.value) })}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #eab308 50%, #22c55e 75%, #10b981 100%)`
                    }}
                  />
                  <div className={`flex justify-between text-xs mt-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <span>0% - Muy baja</span>
                    <span>50% - Moderada</span>
                    <span>100% - Muy alta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Información adicional */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-in-right">
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🔧 Información Adicional
              </h3>
              <button
                type="button"
                onClick={() => setIsAdvanced(!isAdvanced)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isAdvanced 
                    ? 'bg-red-600 text-white' 
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isAdvanced ? 'Ocultar' : 'Mostrar'} opciones avanzadas
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2 dynamic-input">
                <label className={`block text-sm font-bold mb-2 flex items-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className="mr-2">🏷️</span>
                  Etiquetas
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
                  } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                  placeholder="malware, phishing, botnet, apt, ransomware (separadas por comas)"
                />
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Use etiquetas para categorizar y buscar más fácilmente
                </p>
              </div>

              <div className="space-y-2 dynamic-input">
                <label className={`block text-sm font-bold mb-2 flex items-center ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  <span className="mr-2">🔒</span>
                  Clasificación TLP
                </label>
                <select
                  value={formData.tlp}
                  onChange={(e) => setFormData({ ...formData, tlp: e.target.value as any })}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white focus:border-red-500'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-red-500'
                  } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                >
                  <option value="white">{getTlpLabel('white')}</option>
                  <option value="green">{getTlpLabel('green')}</option>
                  <option value="amber">{getTlpLabel('amber')}</option>
                  <option value="red">{getTlpLabel('red')}</option>
                </select>
              </div>
            </div>

            {isAdvanced && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 dynamic-input">
                    <label className={`block text-sm font-bold mb-2 flex items-center ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      <span className="mr-2">📅</span>
                      Primera observación
                    </label>
                    <input
                      type="date"
                      value={formData.firstSeen}
                      onChange={(e) => setFormData({ ...formData, firstSeen: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-red-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-red-500'
                      } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                    />
                  </div>

                  <div className="space-y-2 dynamic-input">
                    <label className={`block text-sm font-bold mb-2 flex items-center ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      <span className="mr-2">📅</span>
                      Última observación
                    </label>
                    <input
                      type="date"
                      value={formData.lastSeen}
                      onChange={(e) => setFormData({ ...formData, lastSeen: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-red-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-red-500'
                      } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                    />
                  </div>
                </div>

                <div className="space-y-2 dynamic-input">
                  <label className={`block text-sm font-bold mb-2 flex items-center ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    <span className="mr-2">📝</span>
                    Notas adicionales
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl resize-none transition-all duration-200 ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                    placeholder="Información complementaria, contexto de descubrimiento, acciones recomendadas, impacto observado..."
                  />
                </div>

                <div className="space-y-2 dynamic-input">
                  <label className={`block text-sm font-bold mb-2 flex items-center ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    <span className="mr-2">🔗</span>
                    Referencias externas
                  </label>
                  <textarea
                    value={formData.references}
                    onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-xl resize-none transition-all duration-200 ${
                      theme === 'dark'
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
                    } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
                    placeholder="URLs de referencia (una por línea)&#10;https://virustotal.com/...&#10;https://threatintel.com/...&#10;https://mitre.org/..."
                  />
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Agregue enlaces a análisis, reportes o fuentes externas
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {errors.submit && (
          <div className={`border-l-4 border-red-400 p-4 animate-fade-in ${
            theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                  {errors.submit}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className={`flex justify-between pt-8 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className={`px-8 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              Cancelar
            </button>
            
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className={`px-8 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                ← Anterior
              </button>
            )}
          </div>

          <div className="flex space-x-4">
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary px-8 py-3 flex items-center"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                    Crear IoC
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Estilos para el slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .dynamic-input {
          animation: slideInUp 0.5s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
  
